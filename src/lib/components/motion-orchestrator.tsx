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
  ".backdrop-rental > *",
  ".backdrop-choice",
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
    let revealIndex = 0;
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
    const registerTree = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(revealSelector)) registerReveal(root);
      root.querySelectorAll<HTMLElement>(revealSelector).forEach(registerReveal);
    };
    const mutations = new MutationObserver((records) => {
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) registerTree(node as HTMLElement);
        }),
      );
    });
    registerTree(document);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  return null;
}
