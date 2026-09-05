import type { Metadata } from "next";
import Link from "next/link";
import BookingPolicy from "@/lib/components/booking-policy";
import GalleryWebglHero from "@/lib/components/gallery-webgl-hero";
export const metadata: Metadata = {
  title: "Booking Terms",
  description:
    "Strike A Pose booking, deposit, payment, cancellation and rescheduling policy.",
};
export default function Terms() {
  return (
    <>
      <GalleryWebglHero
        eyebrow="The practical details"
        title="Booking terms."
        description="Please review these details before confirming your event."
        className="terms-webgl-hero"
      />
      <section className="container legal-page">
        <div className="legal-lede">
          <p className="eyebrow">Before you reserve your date</p>
          <h2>Everything you need to know before your event.</h2>
        </div>
        <BookingPolicy />
        <div className="legal-grid legal-grid--single">
          <section>
            <h3>Photo & video use</h3>
            <p>
              Event photos and videos may be used by Strike A Pose for marketing
              and promotional purposes. Please discuss any preferences or
              restrictions with us before your event so they can be addressed in
              your event agreement.
            </p>
          </section>
        </div>
        <Link href="/contact" className="text-link">
          Questions about your booking? Contact us ↗
        </Link>
      </section>
    </>
  );
}
