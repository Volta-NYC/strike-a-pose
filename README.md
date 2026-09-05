# Strike A Pose

A frontend-only Next.js website for Strike A Pose Photo Booth & Party Services.
Built around the original black-and-gold brand, real local event media, and the
client's revised blueprint and package documents.

## Develop and validate

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm start
```

The App Router pages include Home, Services, Packages, Backdrops, Gallery,
Contact & Book Now, Privacy, and Terms. Business data is centralized in
`src/lib/site-data.ts`; reusable components are in `src/lib/components`.

All photos and videos are served from `public`. See `docs/asset-sources.json`
for provenance and `docs/implementation-notes.md` for content decisions.

The inquiry form creates an email draft for the visitor to send. There is no
backend submission, account system, payment processing, or automatic booking.
Reviews are sourced static quotations, not an automatically synchronized feed.

Deploy through the repository's existing Next.js hosting workflow.
