import type { Metadata } from "next";
import GalleryWebglHero from "@/lib/components/gallery-webgl-hero";
import InquiryForm from "@/lib/components/inquiry-form";
import BookingPolicy from "@/lib/components/booking-policy";
import { business } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact & Book Now",
  description:
    "Plan your Strike A Pose experience. Send an event inquiry with your date, venue name, full address, and preferred package, or call 917-674-5783.",
};

export default function Contact() {
  return (
    <>
      <GalleryWebglHero
        eyebrow="Let’s make memories"
        title="Your event starts here."
        description="Tell us what you’re celebrating. We’ll help you choose the right experience and confirm availability for your date."
        className="contact-webgl-hero"
      />
      <section className="container contact-layout">
        <InquiryForm />
        <aside className="contact-details" aria-label="Contact details">
          <h2 className="contact-side-heading">Get in Touch</h2>
          <p className="contact-side-intro">We’re here to help and happy to answer any questions.</p>
          <section className="contact-detail-group">
            <p className="contact-label">Contact</p>
            <a className="contact-phone" href={business.phoneHref}>
              {business.phone}
            </a>
            <p className="contact-label contact-label--subtle">Business Email</p>
            <a className="contact-email" href={`mailto:${business.email}`}>{business.email}</a>
            <dl className="contact-hours">
              <div>
                <dt>Operating Hours</dt>
                <dd>
                  Monday – Sunday
                  <br />
                  Available 24/7 for inquiries
                </dd>
              </div>
            </dl>
          </section>

          <section className="contact-detail-group">
            <p className="contact-label">Service Areas</p>
            <p className="contact-service-areas">{business.area}</p>
            <p className="contact-small">Travel fees may apply.</p>
          </section>

          <section className="contact-detail-group">
            <p className="contact-credential">NYC DOE-Approved Vendor</p>
            <p>Serving NYC Schools &amp; Special Events</p>
          </section>

          <div className="contact-socials">
            <a
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Find us on Instagram ↗
            </a>
            <a
              href={business.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Find us on Facebook ↗
            </a>
          </div>
        </aside>
      </section>
      <section className="container policy-section">
        <BookingPolicy />
      </section>
    </>
  );
}
