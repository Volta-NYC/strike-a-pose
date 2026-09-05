import Link from "next/link";
import Image from "next/image";
export function Photo({
  src,
  alt,
  contain = false,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  contain?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`photo ${contain ? "contain" : ""} ${className}`}
      data-parallax
    >
      <Image
        src={`/images/${src}`}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 600px"
        priority={priority}
      />
    </div>
  );
}
export function SpinArt() {
  return (
    <div className="spin-art" aria-label="360 degree video experience">
      <div className="spin-orbit" />
      <span>
        360<sup>°</sup>
      </span>
      <p>Capture every angle</p>
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-photo" data-parallax>
        <Image
          src={`/images/${image}`}
          alt=""
          fill
          sizes="100vw"
          priority
        />
      </div>
      <div className="page-hero-shade" />
      <div className="page-intro container page-hero-content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="intro-copy">{description}</p>
      </div>
    </section>
  );
}
export function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <p className="eyebrow">Your next unforgettable moment</p>
        <h2>
          Ready to make your event
          <br />
          unforgettable?
        </h2>
        <Link className="button gold" href="/contact">
          Book Now <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
