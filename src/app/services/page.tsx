import type { Metadata } from "next";
import Link from "next/link";
import { CTA, PageIntro, Photo, SpinArt } from "@/lib/components/site-ui";
import { packages } from "@/lib/site-data";
export const metadata: Metadata = {
  title: "Services",
  description:
    "Discover Nova DSLR, Mirror and 360 photo booths, audio guest books, red carpet experiences and marquee numbers for your next event.",
};
export default function Services() {
  return (
    <>
      <PageIntro
        eyebrow="The experience is everything"
        title="A little glamour. A lot of fun."
        description="From the first pose to the last heartfelt message, give your guests something to remember."
      />
      <div className="container service-stories">
        {packages.map((p, i) => (
          <section
            id={p.id}
            className={`service-story ${i % 2 ? "reverse" : ""}`}
            key={p.id}
          >
            <div>
              {p.image ? (
                <Photo src={p.image} alt={p.alt} contain />
              ) : (
                <SpinArt />
              )}
            </div>
            <div className="story-copy">
              <p className="eyebrow">{p.short}</p>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <ul className="inclusion-list">
                {p.inclusions.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <Link
                href={`/contact?experience=${p.id}`}
                className="button gold"
              >
                Request a Quote ↗
              </Link>
              <Link href={`/packages#${p.id}`} className="text-link">
                View package details
              </Link>
            </div>
          </section>
        ))}
      </div>
      <section className="section enhance" id="extras">
        <div className="container enhance-grid">
          <Photo
            src="red-carpet.webp"
            alt="A red carpet entrance with gold stanchions and velvet ropes"
            contain
          />
          <div>
            <p className="eyebrow">Make an entrance</p>
            <h2>Luxury Red Carpet Experience</h2>
            <p>
              Give your guests the VIP treatment with a red carpet, stanchions
              and ropes, a step-and-repeat backdrop, and a VIP photo experience.
            </p>
            <h3 className="marquee-heading">Illuminated Marquee Numbers</h3>
            <p>
              Make a statement with elegant, illuminated marquee numbers for
              birthdays, anniversaries, weddings, and special celebrations.
            </p>
            <Link href="/contact?experience=add-ons" className="button gold">
              Ask About Event Add-ons ↗
            </Link>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
