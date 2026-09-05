import Link from "next/link";
import Hero from "@/lib/components/hero";
import { CTA, Photo, SpinArt } from "@/lib/components/site-ui";
import { business, packages, reviews } from "@/lib/site-data";
export default function Home() {
  return (
    <>
      <Hero />
      <div className="occasion-bar">
        <span>Made for your moment</span>
        <span>NYC · NJ · CT</span>
        <span>Set up. Strike a pose. Celebrate.</span>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The life of the party</p>
            <h2>Our Core Experiences</h2>
          </div>
          <Link href="/services" className="text-link">
            Discover all services ↗
          </Link>
        </div>
        <div className="experience-grid">
          {[packages[0], packages[2], packages[3]].map((p) => (
            <article key={p.id} className="experience">
              <Link href={`/services#${p.id}`} aria-label={`Explore ${p.name}`}>
                {p.image ? (
                  <Photo src={p.image} alt={p.alt} contain />
                ) : (
                  <SpinArt />
                )}
              </Link>
              <div className="experience-copy">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <Link href={`/services#${p.id}`} className="text-link">
                  Explore experience ↗
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="enhance section">
        <div className="container enhance-grid">
          <Photo
            src="red-carpet.webp"
            alt="Red carpet, gold stanchions and a photo booth ready for guests"
          />
          <div>
            <p className="eyebrow">The finishing touches</p>
            <h2>Enhance Your Event</h2>
            <p>
              Turn an entrance into a moment. Bring your theme to life with
              thoughtful details that make the celebration yours.
            </p>
            <Link href="/contact?experience=red-carpet" className="service-line">
              <span>Luxury Red Carpet Experience</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/contact?experience=marquee" className="service-line">
              <span>Illuminated Marquee Numbers</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/backdrops" className="service-line">
              <span>Beautiful Backdrops</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/packages#add-ons" className="button gold">
              Explore Event Add-ons ↗
            </Link>
          </div>
        </div>
      </section>
      <section className="section container why">
        <p className="eyebrow">Why Strike A Pose</p>
        <h2>
          A celebration ends.
          <br />
          <em>The memories stay.</em>
        </h2>
        <p>
          At Strike A Pose, we create fun and unforgettable experiences that
          bring your celebration to life. We help you capture authentic moments,
          create lasting memories, and give you and your guests something to
          smile about long after the celebration ends.
        </p>
        <Link href="/packages" className="text-link">
          Find your perfect package ↗
        </Link>
      </section>
      <section className="reviews-section section" id="reviews">
        <div className="container">
          <div className="center-heading">
            <p className="eyebrow">A little guest love</p>
            <h2>
              Loved by Event Hosts
              <br />
              Across NYC & Beyond
            </h2>
            <p>Selected Google reviews from our event hosts.</p>
          </div>
          <div className="review-grid">
            {reviews.map((r) => (
              <figure className="review" key={r.name}>
                <div className="stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <blockquote>“{r.text}”</blockquote>
                <figcaption>
                  <strong>{r.name}</strong>
                  <span>Google review</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="center">
            <a
              href={business.reviews}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              See more reviews on Google ↗
            </a>
          </div>
        </div>
      </section>
      <section className="section container gallery-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Real smiles. Real celebrations.</p>
            <h2>
              Memories Made.
              <br />
              Moments Captured.
            </h2>
          </div>
          <Link href="/gallery" className="text-link">
            Explore the gallery ↗
          </Link>
        </div>
        <div className="preview-grid">
          <Photo
            src="luau-friends.webp"
            alt="Friends celebrating at Zach’s luau birthday photo booth"
            contain
          />
          <Photo
            src="nova-luau.webp"
            alt="The Nova booth ready for a tropical birthday celebration"
            contain
          />
          <Photo
            src="luau-celebration.webp"
            alt="Three guests posing with birthday props"
            contain
          />
        </div>
      </section>
      <div className="credential container">
        <div>
          <strong>NYC DOE-Approved Vendor</strong>
          <p>Serving NYC Schools & Special Events</p>
        </div>
      </div>
      <CTA />
    </>
  );
}
