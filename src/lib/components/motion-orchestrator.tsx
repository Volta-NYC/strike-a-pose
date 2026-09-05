"use client";

import { useEffect } from "react";

const revealSelector = [
  ".page-intro > *",
  ".section-heading > *",
  ".experience",
  ".enhance-grid > *",
  ".why > *",
  ".review",
  ".preview-grid > *",
  ".credential",
  ".cta .container > *",
  ".service-story > *",
  ".gallery-grid > *",
  ".package-card",
].join(",");

export default function MotionOrchestrator() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    reveals.forEach((element, index) => {
      element.classList.add("js-reveal", `reveal-${index % 3}`);
    });
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -30px" },
    );
    reveals.forEach((element) => revealObserver.observe(element));

    const photos = Array.from(
      document.querySelectorAll<HTMLElement>(".photo[data-parallax]"),
    );
    const active = new Set<HTMLElement>();
    const parallaxObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) active.add(entry.target as HTMLElement);
          else active.delete(entry.target as HTMLElement);
        }),
      { rootMargin: "120px 0px" },
    );
    photos.forEach((photo) => parallaxObserver.observe(photo));
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const midpoint = window.innerHeight / 2;
      active.forEach((photo) => {
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateParallax();
    return () => {
      revealObserver.disconnect();
      parallaxObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
