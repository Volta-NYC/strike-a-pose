import type { Metadata } from "next";
import Link from "next/link";
import { CTA, PageIntro, Photo } from "@/lib/components/site-ui";
import { backdrops } from "@/lib/site-data";
export const metadata: Metadata = {
  title: "Backdrops",
  description:
    "Browse white, gold, silver, rose gold, flower wall, hedge wall, and custom backdrops to complement your Strike A Pose experience.",
};
export default function Backdrops() {
  return (
    <>
      <PageIntro
        eyebrow="Set the scene"
        title="The perfect backdrop for you."
        description="Timeless neutrals, a little shimmer, or a statement wall. Find the finishing touch for your photo booth experience."
      />
      <section
        className="container backdrop-grid"
        aria-label="Backdrop collection"
      >
        {backdrops.map(([name, image]) => (
          <article key={name}>
            <Link
              href={`/contact?backdrop=${encodeURIComponent(name)}`}
              aria-label={`Ask about the ${name} backdrop`}
            >
              <Photo src={image} alt={`${name} photo booth backdrop`} contain />
              <h2>{name}</h2>
              <span className="text-link">Ask about this backdrop ↗</span>
            </Link>
          </article>
        ))}
      </section>
      <p className="collection-note container">
        Let us know your preferred backdrop when you inquire. Availability and
        custom options will be confirmed with your quote.
      </p>
      <CTA />
    </>
  );
}
