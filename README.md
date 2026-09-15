# Strike A Pose

A Next.js website for Strike A Pose Photo Booth & Party Services. Built around
the original black-and-gold brand, real local event media, and the client's
revised blueprint and package documents.

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

The inquiry form sends an email to Strike A Pose and an automatic confirmation
to the visitor. Copy `.env.example` into your deployment environment and set
these variables to activate delivery:

```
RESEND_API_KEY=re_...
INQUIRY_FROM_EMAIL=Strike A Pose <inquiries@your-verified-domain.com>
```

`INQUIRY_FROM_EMAIL` must be a sender verified in the Resend account. The form
does not create accounts, accept payment, or reserve a date. Reviews are sourced
static quotations, not an automatically synchronized feed.

Deploy through the repository's existing Next.js hosting workflow.
