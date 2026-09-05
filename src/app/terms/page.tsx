import type { Metadata } from "next";
import Link from "next/link";
import BookingPolicy from "@/lib/components/booking-policy";
import { PageIntro } from "@/lib/components/site-ui";
export const metadata: Metadata = {
  title: "Booking Terms",
  description:
    "Strike A Pose booking, deposit, payment, cancellation and rescheduling policy.",
};
export default function Terms() {
  return (
    <>
      <PageIntro
        eyebrow="The practical details"
        title="Booking terms."
        description="Please review these details before confirming your event."
      />
      <section className="container legal-page">
        <BookingPolicy />
        <h2>Photo & video use</h2>
        <p>
          Event photos and videos may be used by Strike A Pose for marketing and
          promotional purposes. Please discuss any preferences or restrictions
          with us before your event so they can be addressed in your event
          agreement.
        </p>
        <Link href="/contact" className="text-link">
          Questions about your booking? Contact us ↗
        </Link>
      </section>
    </>
  );
}
