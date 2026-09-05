import type { Metadata } from "next";
import Image from "next/image";
import { CTA, PageIntro } from "@/lib/components/site-ui";
export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Real Strike A Pose event moments, photo booth setups, birthday celebrations, and guest photos.",
};
const photos: [string, string, string, number, number][] = [
  [
    "luau-celebration.webp",
    "Birthday smiles",
    "Three guests posing with props at Zach’s luau birthday",
    458,
    603,
  ],
  [
    "nova-luau.webp",
    "The booth is ready",
    "Nova photo booth with professional flash and umbrella at a luau",
    449,
    604,
  ],
  [
    "luau-friends.webp",
    "A moment with your people",
    "Friends posing in leis at a tropical birthday celebration",
    403,
    610,
  ],
  [
    "nova-yacht.webp",
    "Celebrating on the water",
    "Nova booth beside large windows overlooking the water",
    458,
    610,
  ],
  [
    "nova-guest.webp",
    "Strike a pose",
    "Guest posing in front of a gold backdrop with the Nova booth",
    456,
    603,
  ],
  [
    "red-carpet.webp",
    "The VIP arrival",
    "Full red carpet setup leading to a photo booth",
    503,
    608,
  ],
  [
    "nova-detail.webp",
    "Picture-perfect details",
    "Close view of the Nova booth with a live preview on screen",
    337,
    606,
  ],
  [
    "mirror-booth.webp",
    "A little mirror magic",
    "Guest using the interactive mirror photo booth",
    358,
    470,
  ],
];
export default function Gallery() {
  return (
    <>
      <PageIntro
        eyebrow="Through our lens"
        title="Good times. Great keepsakes."
        description="A glimpse of our booths, our celebrations, and the people who make every event special."
        image="champagne-backdrop-11.webp"
      />
      <section className="container event-gallery" aria-label="Event photos">
        {photos.map(([src, caption, alt, width, height]) => (
          <figure key={src}>
            <a
              href={`/images/${src}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open full image: ${caption}`}
            >
              <span className="gallery-image-link">
                <Image
                  src={`/images/${src}`}
                  alt={alt}
                  width={width}
                  height={height}
                  sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc(50vw - 42px), 380px"
                />
              </span>
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
