"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Hero() {
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (media.current) {
        media.current.style.transform = preference.matches
          ? "none"
          : `translate3d(0, ${Math.min(window.scrollY * 0.09, 55)}px, 0)`;
      }
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    preference.addEventListener("change", update);
    update();
    return () => {
      window.removeEventListener("scroll", scroll);
      preference.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-photo" ref={media}>
        <Image
          src="/images/hero-strike-a-pose.avif"
          alt="Guests celebrating under colorful party lights"
          fill
          sizes="(max-width: 800px) 100vw, 58vw"
          priority
        />
      </div>
      <div className="hero-shade" />
      <div className="container hero-content">
        <p className="eyebrow">Strike A Pose · Photo Booth &amp; Party Services</p>
        <h1>
          Make Your Event
          <br />
          <em>Unforgettable.</em>
        </h1>
        <p className="hero-description">
          Premium photo booth and event experiences that bring your celebration
          to life.
        </p>
        <p className="occasions">
          Weddings • Birthdays • Baby Showers • Bar &amp; Bat Mitzvahs •
          Graduations • Corporate Events &amp; More
        </p>
        <div className="button-row">
          <Link href="/contact" className="button gold">
            Book Now <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="hero-caption">
        Good company. Great memories. <span>Strike a pose.</span>
      </div>
    </section>
  );
}
