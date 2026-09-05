import type { Metadata } from "next";
import { PageIntro } from "@/lib/components/site-ui";
import { business } from "@/lib/site-data";
export const metadata: Metadata = {
  title: "Website Privacy",
  description:
    "How this website handles your event inquiry and links to external services.",
};
export default function Privacy() {
  return (
    <>
      <PageIntro
        eyebrow="Your information"
        title="Website privacy."
        description="A simple explanation of how this website handles your inquiry."
        image="hero-strike-a-pose.avif"
      />
      <section className="container legal-page">
        <div className="legal-lede">
          <p className="eyebrow">A straightforward promise</p>
          <h2>Your event inquiry stays between you and Strike A Pose.</h2>
        </div>
        <div className="legal-grid">
          <section>
            <h3>Information you choose to share</h3>
            <p>
              The inquiry form prepares an email on your device. Form details are
              not submitted to a website database. When you choose to send the
              email, your email provider delivers your name, contact information,
              and event details to Strike A Pose so the team can respond to your
              request.
            </p>
          </section>
          <section>
            <h3>Website storage and external services</h3>
            <p>
              This website does not set advertising or analytics cookies. The
              hosting provider may process standard request information, such as
              IP addresses and browser details, to deliver and protect the
              website. Google Maps and Instagram have their own privacy practices
              and open only when you follow their links.
            </p>
          </section>
          <section>
            <h3>Event photos and videos</h3>
            <p>
              Selected event media appears on this website. For questions about a
              photo or video, or to discuss your event’s media preferences,
              please contact Strike A Pose.
            </p>
          </section>
          <section>
            <h3>Contact</h3>
            <p>
              For questions about information you have shared with Strike A Pose,
              email <a href={`mailto:${business.email}`}>{business.email}</a> or
              call <a href={business.phoneHref}>{business.phone}</a>.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
