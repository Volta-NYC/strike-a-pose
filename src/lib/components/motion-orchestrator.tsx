"use client";

import { useEffect } from "react";

const revealSelector = [
  ".page-hero-content > *",
  ".section-heading > *",
  ".experience",
  ".enhance-grid > *",
  ".why > *",
  ".review",
  ".preview-grid > *",
  ".credential",
  ".cta .container > *",
  ".service-story > *",
  ".event-gallery > *",
  ".backdrop-grid > *",
  ".package-card",
  ".addon-grid > *",
  ".faq-layout > *",
  ".contact-layout > *",
  ".legal-page > *",
].join(",");

/** Keeps transitions route-aware, so client navigation cannot leave new copy hidden. */
export default function MotionOrchestrator() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const knownReveals = new WeakSet<HTMLElement>();
    const knownPhotos = new WeakSet<HTMLElement>();
    const activePhotos = new Set<HTMLElement>();
    let revealIndex = 0;
    let frame = 0;
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    const photoObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) activePhotos.add(entry.target as HTMLElement);
          else activePhotos.delete(entry.target as HTMLElement);
        }),
      { rootMargin: "120px 0px" },
    );
    const registerReveal = (element: HTMLElement) => {
      if (knownReveals.has(element)) return;
      knownReveals.add(element);
      element.classList.add("js-reveal", `reveal-${revealIndex++ % 3}`);
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.94 && bounds.bottom > 0) {
        element.classList.add("is-inview");
      } else {
        revealObserver.observe(element);
      }
    };
    const registerPhoto = (element: HTMLElement) => {
      if (knownPhotos.has(element)) return;
      knownPhotos.add(element);
      photoObserver.observe(element);
    };
    const registerTree = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(revealSelector)) registerReveal(root);
      root.querySelectorAll<HTMLElement>(revealSelector).forEach(registerReveal);
      if (root instanceof HTMLElement && root.matches(".photo[data-parallax]")) registerPhoto(root);
      root.querySelectorAll<HTMLElement>(".photo[data-parallax]").forEach(registerPhoto);
    };
    const updateParallax = () => {
      frame = 0;
      const midpoint = window.innerHeight / 2;
      activePhotos.forEach((photo) => {
        const image = photo.querySelector("img");
        if (!image) return;
        const bounds = photo.getBoundingClientRect();
        const distance = (bounds.top + bounds.height / 2 - midpoint) / window.innerHeight;
        image.style.transform = `translate3d(0, ${Math.max(-12, Math.min(12, distance * -22))}px, 0) scale(1.045)`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateParallax);
    };
    const mutations = new MutationObserver((records) => {
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) registerTree(node as HTMLElement);
        }),
      );
      onScroll();
    });
    registerTree(document);
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateParallax();
    return () => {
      mutations.disconnect();
      revealObserver.disconnect();
      photoObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
