import { NextResponse } from "next/server";
// Load only the Sheets client instead of every Google API.
import { auth, sheets } from "googleapis/build/src/apis/sheets";
import { validateContact } from "@/lib/contact";

export const runtime = "nodejs";

const maxBodyBytes = 16 * 1024;
const receivedMessage = "Your inquiry has been received. Our team will be in touch about your event.";

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing request body");
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBodyBytes) {
        await reader.cancel();
        throw new RangeError("Request body too large");
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  // Next.js may normalize the URL to localhost behind a proxy. Host identifies
  // the browser-facing destination without trusting a supplied forwarded host.
  const expectedOrigin = `${requestUrl.protocol}//${request.headers.get("host") || requestUrl.host}`;
  if ((origin && origin !== expectedOrigin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ message: "Please submit your inquiry from this website." }, { status: 403 });
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ message: "Please send the form as JSON." }, { status: 415 });
  }

  let input: unknown;
  try {
    input = await readBody(request);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof RangeError ? "Your inquiry is too long. Please shorten the details and try again." : "We could not read your inquiry. Please try again." },
      { status: error instanceof RangeError ? 413 : 400 },
    );
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ message: "Please complete the inquiry form and try again." }, { status: 400 });
  }
  const inquiry = input as Record<string, unknown>;
  // Preserve the existing honeypot without saving spam or contacting Google.
  if (typeof inquiry.website === "string" && inquiry.website.trim()) {
    return NextResponse.json({ message: receivedMessage });
  }
  const result = validateContact(inquiry);
  if (!result.valid) {
    return NextResponse.json({ message: "Please check the highlighted fields and try again.", errors: result.errors }, { status: 400 });
  }

  // These values are read only on the server, never imported by the form.
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.error("Contact delivery is missing server configuration.");
    return NextResponse.json({ message: "Online inquiry delivery is temporarily unavailable. Please use the email option below or call us directly." }, { status: 503 });
  }

  const { data } = result;
  const eventType = data.eventType === "Other Celebrations" ? `${data.eventType}: ${data.celebrationDetail}` : data.eventType;
  // The supplied header has no Backdrop column. Keep that choice in the final cell.
  const notes = [data.notes, data.backdrop ? `Preferred backdrop: ${data.backdrop}` : ""].filter(Boolean).join("\n\n");

  try {
    const authentication = new auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const client = sheets({ version: "v4", auth: authentication });
    await client.spreadsheets.values.append({
      spreadsheetId,
      range: "'Sheet1'!A:J",
      // RAW keeps phone/date strings intact and prevents spreadsheet formula injection.
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        majorDimension: "ROWS",
        values: [[
          new Date().toISOString(),
          data.name,
          data.email,
          data.phone,
          data.date,
          eventType,
          data.venue,
          data.experiences.join(", ") || "Help me choose",
          data.hours,
          notes,
        ]],
      },
    }, { timeout: 15_000, retry: false });
  } catch {
    // Google errors can contain credentials and submitted data. Never log or return them.
    console.error("Contact spreadsheet append failed.");
    return NextResponse.json({ message: "We could not confirm delivery of your inquiry. Please use the email option below or call us directly." }, { status: 502 });
  }

  return NextResponse.json({ message: receivedMessage });
}
