# Strike A Pose

A Next.js website for Strike A Pose Photo Booth & Party Services. Built around
the original black-and-gold brand, real local event media, and the client's
revised blueprint and package documents.

## Develop and validate

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

The App Router pages include Home, Services, Packages, Backdrops, Gallery,
Contact & Book Now, Privacy, and Terms. Business data is centralized in
`src/lib/site-data.ts`; reusable components are in `src/lib/components`.

All photos and videos are served from `public`. See `docs/asset-sources.json`
for provenance and `docs/implementation-notes.md` for content decisions.

The inquiry form posts JSON to `/api/contact`, which validates the fields and
appends one row to the `Sheet1` tab through the Google Sheets API. The previous
`/api/inquiry` endpoint delegates to the same handler. Set these server-only
variables in Vercel (or an ignored `.env.local` for local development):

```
GOOGLE_SHEETS_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```

Enable the Google Sheets API and share the spreadsheet with the service account
email as an Editor. The private key supports actual newlines or literal `\n`
sequences. Never use a `NEXT_PUBLIC_` prefix for these values. No credentials are
needed at build time, and no credentials belong in source control.

Keep these existing headers in row 1, columns A through J, in this order:

| Submitted At | Name | Email | Phone # | Event Date | Event Type | Venue Name/Address | Preferred Experiences | Hours | Anything else we should know |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Submission timestamps use UTC ISO 8601. “Other Celebrations” details are included
in Event Type. The preferred backdrop is included with the notes in the final
column because the supplied sheet has no backdrop column. The hidden spam trap
is never saved. Values are written with `RAW` input so phone numbers remain text
and user input cannot execute spreadsheet formulas. The route uses a 16 KiB body
limit, a same-origin check, a 15-second Google request timeout, and no automatic
append retries. Google failures return a generic message without logging keys
or inquiry contents.

The form confirms success only after Google accepts the append. On failure it
keeps the visitor’s entries and provides the existing email/copy fallback. Sheets
delivery does not send an automatic email. The form does not create accounts,
accept payment, or reserve a date. Tests mock Google authentication and writes;
verify a real submission in Vercel after deployment. This project does not
currently configure a lint script; `typecheck`, tests, and the production build
are the available checks.

Reviews are sourced static quotations, not an automatically synchronized feed.

To email each new Sheet row from `tahmid@novusnyc.org` to
`islamtahmidd@gmail.com`, install the optional
[Apps Script notification helper](docs/apps-script/README.md). It includes all
ten columns and checks for new rows once per minute. It runs separately in the
spreadsheet and does not require any website or Vercel configuration changes.

Deploy through the repository's existing Next.js hosting workflow.
