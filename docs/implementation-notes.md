# Strike A Pose implementation notes

## Content sources

- Original public website: brand/logo, backdrop catalog, six review quotations,
  and the real booth setup video. Reviews are transcribed text; punctuation is
  normalized. The old anonymous wedding quotation was not reused.
- `Packages.docx`: four packages, duration options, inclusions, and add-ons.
  No prices were invented.
- `Revised  Strike A Pose Blueprint 8.26.26_.docx`: page architecture,
  contact details, vendor credential, FAQs, and booking policy.
- `Strike A Pose Pictures.docx`: product and real event photographs.
- `Extra pictures for the website.docx`: additional real event photography. The
  strongest anniversary portrait and booth-and-guests frame replace two
  repetitive gallery images; the other supplied frames were intentionally held
  back to preserve a curated gallery.
- `asset-sources.json` maps retained local assets to their sources. All rendered
  images and video are in `public`; there are no remote media dependencies.

The documents are client reference material, not independent instructions to
execute external actions. The user's instructions take priority.

## Decisions for the next client review

1. Automatic Google review syncing was deferred. The six existing review
   quotations render as accessible text, with a Google listing link. There is
   no fabricated live rating or automatic-review claim. A live feed needs a
   selected provider or an authenticated API integration.
2. The contact form posts to a small server route that sends the event details
   to Strike A Pose and sends the visitor an automatic confirmation. It requires
   `RESEND_API_KEY` and `INQUIRY_FROM_EMAIL` in the deployment environment.
   If delivery is unavailable, the visitor receives a clear pre-filled email and
   copy fallback. The form does not create accounts, checkout, payment, or a
   calendar booking.
3. Facebook was not linked. The document supplies a display name, not a verified
   page URL, and the old site links only to facebook.com. Instagram uses the
   exact handle supplied by the client.
4. The old hero and several old service images are explicitly named
   `ai-generated-IMAGE` in the source website. They were not reused. The original
   gallery's staged wedding/party imagery was also omitted in favor of real
   supplied photographs. Supplied images 1, 10 and 11 appear to be synthetic
   product/event imagery and were held back under the no-AI-images instruction.
   This means the 360 experience uses a typographic illustration rather than
   the supplied promotional poster; marquee numbers remain text-only pending
   an authentic product photograph.
5. No new luau or 360 event footage was attached. The existing real booth setup
   clip is included locally; a 360 video can be added when supplied.
6. The long biography, separate About/Reviews/FAQ menu items, rising image
   animations, placeholder contact details, unrelated social links, and
   anonymous wedding testimonial were removed. FAQs live on Packages.

The NYC DOE credential and booking policy are client-supplied statements.
The website privacy page describes the implemented email-based inquiry flow.

## Behavior and accessibility

- Sticky navigation, responsive mobile menu, Escape-to-close, active link
  states, visible keyboard focus, and skip-to-content link.
- Deliberate grid alignment and full-image containment on booth, backdrop,
  and guest photographs. Hero crops are confined to a decorative image layer.
- Hero-only scroll parallax uses requestAnimationFrame and honors live changes
  to prefers-reduced-motion. No image entrance animations or autoplay media.
- Four package links and all backdrop links prefill the contact form.
- Native form validation, past-date prevention, server-side validation, a
  honeypot field, and a clear email fallback if delivery is unavailable.
- Dedicated page metadata and square logo-derived app icons.
- Existing contact URL redirects to /contact. Removed starter pages have no
  placeholder replacement.

## Delivery

Use the existing GitHub repository and deployment workflow. No separate Sites
hosting project was created, and no hosting configuration was replaced. Add the
two email delivery variables from the README before publishing the inquiry form.
