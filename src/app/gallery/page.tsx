import type { Metadata } from "next";
import { CTA, PageIntro, Photo } from "@/lib/components/site-ui";
export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Real Strike A Pose event moments, photo booth setups, birthday celebrations, and guest photos.",
};
const photos = [
  [
    "luau-celebration.webp",
    "Birthday smiles",
    "Three guests posing with props at Zach’s luau birthday",
  ],
  [
    "nova-luau.webp",
    "The booth is ready",
    "Nova photo booth with professional flash and umbrella at a luau",
  ],
  [
    "luau-friends.webp",
    "A moment with your people",
    "Friends posing in leis at a tropical birthday celebration",
  ],
  [
    "nova-yacht.webp",
    "Celebrating on the water",
    "Nova booth beside large windows overlooking the water",
  ],
  [
    "nova-guest.webp",
    "Strike a pose",
    "Guest posing in front of a gold backdrop with the Nova booth",
  ],
  [
    "red-carpet.webp",
    "The VIP arrival",
    "Full red carpet setup leading to a photo booth",
  ],
  [
    "nova-detail.webp",
    "Picture-perfect details",
    "Close view of the Nova booth with a live preview on screen",
  ],
  [
    "mirror-booth.webp",
    "A little mirror magic",
    "Guest using the interactive mirror photo booth",
  ],
];
export default function Gallery() {
  return (
    <>
      <PageIntro
        eyebrow="Through our lens"
        title="Good times. Great keepsakes."
        description="A glimpse of our booths, our celebrations, and the people who make every event special."
        image="luau-friends.webp"
      />
      <section className="container event-gallery" aria-label="Event photos">
        {photos.map(([src, caption, alt]) => (
          <figure key={src}>
            <a
              href={`/images/${src}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open full image: ${caption}`}
            >
              <Photo src={src} alt={alt} contain />
            </a>
            <figcaption>{caption}</figcaption>
          </figure>
        ))}
      </section>
      <section className="section container video-section">
        <div>
          <p className="eyebrow">A look behind the photos</p>
          <h2>All set for a celebration.</h2>
          <p>
            Take a closer look at the booth and gold backdrop from a real event.
          </p>
        </div>
        <figure>
          <video
            controls
            playsInline
            preload="none"
            poster="/images/d63433c4-bb7d-40ff-8a7e-2918069fbfad-mp4-14.webp"
            aria-label="A tour of the photo booth and gold backdrop setup"
          >
            <source src="/videos/luau-booth.mp4" type="video/mp4" />
            Your browser does not support video.{" "}
            <a href="/videos/luau-booth.mp4">Download the event video</a>.
          </video>
          <figcaption>Strike A Pose event setup</figcaption>
        </figure>
      </section>
      <CTA />
    </>
  );
}
