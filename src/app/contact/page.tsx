import type { Metadata } from "next";
import { PageIntro } from "@/lib/components/site-ui";
import InquiryForm from "@/lib/components/inquiry-form";
import BookingPolicy from "@/lib/components/booking-policy";
import { business } from "@/lib/site-data";
export const metadata: Metadata = {
  title: "Contact & Book Now",
  description:
    "Plan your Strike A Pose experience. Call 917-674-5783 or prepare an event inquiry with your date, location and preferred package.",
};
export default function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="Let’s make memories"
        title="Your event starts here."
        description="Tell us what you’re celebrating. We’ll help you choose the right experience and confirm availability for your date."
        image="white-flower-wall-backdrop-12.webp"
      />
      <section className="container contact-layout">
        <aside className="contact-details">
          <p className="eyebrow">Say hello</p>
          <a className="contact-phone" href={business.phoneHref}>
            {business.phone}
          </a>
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <h2>Where we celebrate</h2>
          <p>{business.area}</p>
          <p className="contact-small">Travel fees may apply.</p>
          <div className="contact-credential">NYC DOE-Approved Vendor</div>
          <p>Serving NYC Schools & Special Events</p>
          <a
            href={business.instagram}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Find us on Instagram ↗
          </a>
        </aside>
        <InquiryForm />
      </section>
      <section className="container policy-section">
        <BookingPolicy />
      </section>
    </>
  );
}
