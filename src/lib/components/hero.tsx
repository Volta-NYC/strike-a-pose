"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import EventField from "./event-field";
export default function Hero() {
  const media = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (media.current)
        media.current.style.transform = preference.matches
          ? "none"
          : `translate3d(0, ${Math.min(window.scrollY * 0.16, 115)}px, 0)`;
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
          alt="Guests celebrating together at a Strike A Pose photo booth event"
          fill
          sizes="(max-width: 700px) 100vw, 55vw"
          priority
        />
      </div>
      <EventField />
      <div className="hero-shade" />
      <div className="container hero-content">
        <p className="eyebrow">Strike A Pose · Photo Booth & Party Services</p>
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
          Weddings · Birthdays · Graduations · Corporate Events
        </p>
        <div className="button-row">
          <Link href="/contact" className="button gold">
            Book Now <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/services" className="button button-outline">
            Explore Our Experiences
          </Link>
        </div>
      </div>
      <div className="hero-caption">
        Good company. Great memories. <span>Strike a pose.</span>
      </div>
    </section>
  );
}
