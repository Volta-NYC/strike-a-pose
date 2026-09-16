import type { Metadata } from "next";
import BackdropSelector from "@/lib/components/backdrop-selector";
import { CTA } from "@/lib/components/site-ui";
import GalleryWebglHero from "@/lib/components/gallery-webgl-hero";

export const metadata: Metadata = {
  title: "Backdrops",
  description:
    "Browse the full Strike A Pose backdrop collection, from shimmer walls and florals to crisp classics and personalized custom backdrops.",
};

export default function Backdrops() {
  return (
    <>
      <GalleryWebglHero
        eyebrow="Set the scene"
        title="Find the backdrop for your moment."
        description="Browse the complete collection in one place, then let us know which one brings your event vision to life."
        className="backdrops-webgl-hero"
      />
      <section className="section container" aria-labelledby="backdrop-collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The full collection</p>
            <h2 id="backdrop-collection">Every backdrop, all in one place.</h2>
          </div>
        </div>
        <p className="collection-note">
          Every celebration has its own point of view. Choose the backdrop that
          makes yours feel complete.
        </p>
        <BackdropSelector />
      </section>
      <CTA />
    </>
  );
}
