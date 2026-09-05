import type { Metadata } from "next";
import Link from "next/link";
import { CTA } from "@/lib/components/site-ui";
import GalleryWebglHero from "@/lib/components/gallery-webgl-hero";
import { packages, faqs } from "@/lib/site-data";
export const metadata: Metadata = {
  title: "Packages",
  description:
    "Compare four photo booth and audio guest book packages, with 2, 3 or 4 hours and personalized event add-ons. Request a custom quote.",
};
export default function Packages() {
  return (
    <>
      <GalleryWebglHero
        eyebrow="Your celebration, your way"
        title="Find your perfect package."
        description="Choose your experience. Pick your hours. Add the details that make it yours."
        className="packages-webgl-hero"
      />
      <section className="container package-grid" aria-label="Event packages">
        {packages.map((p) => (
          <article className="package-card" id={p.id} key={p.id}>
            <p className="eyebrow">{p.short}</p>
            <h2>{p.name}</h2>
            <p className="hours">
              2 Hours <span>·</span> 3 Hours <span>·</span> 4 Hours
            </p>
            <ul className="inclusion-list">
              {p.inclusions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <Link href={`/contact?experience=${p.id}`} className="button gold">
              Request a Quote ↗
            </Link>
          </article>
        ))}
      </section>
      <section className="section container" id="add-ons">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A little extra goes a long way</p>
            <h2>Elevate Your Event</h2>
          </div>
        </div>
        <div className="addon-grid">
          <article>
            <h3>VIP Red Carpet Experience</h3>
            <p>
              Make a grand entrance with our VIP Red Carpet Experience,
              featuring:
            </p>
            <ul className="inclusion-list">
              <li>Red Carpet</li>
              <li>Stanchions & Ropes</li>
              <li>Step-and-Repeat Backdrop</li>
              <li>VIP Photo Experience</li>
            </ul>
            <Link href="/contact?experience=red-carpet" className="text-link">
              Add the VIP experience ↗
            </Link>
          </article>
          <article>
            <h3>Illuminated Marquee Numbers</h3>
            <p>
              Make a statement with elegant, illuminated marquee numbers that
              add the perfect touch to birthdays, anniversaries, weddings, and
              special celebrations.
            </p>
            <Link href="/contact?experience=marquee" className="text-link">
              Ask about marquee numbers ↗
            </Link>
          </article>
        </div>
      </section>
      <section className="faq-section section">
        <div className="container faq-layout">
          <div>
            <p className="eyebrow">A few helpful details</p>
            <h2>Before the party.</h2>
            <p>Have questions? We’re happy to help.</p>
            <Link href="/contact" className="text-link">
              Contact Strike A Pose ↗
            </Link>
          </div>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
