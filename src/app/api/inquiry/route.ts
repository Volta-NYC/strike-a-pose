import { NextResponse } from "next/server";
import { business } from "@/lib/site-data";

type Inquiry = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  date?: unknown;
  eventType?: unknown;
  venue?: unknown;
  experiences?: unknown;
  backdrop?: unknown;
  hours?: unknown;
  notes?: unknown;
  website?: unknown;
};

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    })[character] as string,
  );

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendEmail(
  apiKey: string,
  message: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    text: string;
    reply_to?: string;
  },
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error("Email delivery failed");
  }
}

export async function POST(request: Request) {
  let inquiry: Inquiry;

  try {
    inquiry = (await request.json()) as Inquiry;
  } catch {
    return NextResponse.json({ message: "Please complete the form and try again." }, { status: 400 });
  }

  if (cleanText(inquiry.website, 200)) {
    return NextResponse.json({
      message: "Your inquiry has been received and a confirmation email is on its way.",
    });
  }

  const name = cleanText(inquiry.name, 100);
  const email = cleanText(inquiry.email, 200).toLowerCase();
  const phone = cleanText(inquiry.phone, 40) || "Not provided";
  const date = cleanText(inquiry.date, 10);
  const eventType = cleanText(inquiry.eventType, 200);
  const venue = cleanText(inquiry.venue, 200);
  const backdrop = cleanText(inquiry.backdrop, 100) || "Help me choose";
  const hours = cleanText(inquiry.hours, 40) || "Not sure yet";
  const notes = cleanText(inquiry.notes, 2000) || "None added";
  const experiences = Array.isArray(inquiry.experiences)
    ? inquiry.experiences
        .map((experience) => cleanText(experience, 120))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  if (
    !name ||
    !emailPattern.test(email) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !eventType ||
    !venue
  ) {
    return NextResponse.json(
      { message: "Please complete the required fields with valid information." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;

  if (!apiKey || !from) {
    return NextResponse.json(
      {
        message:
          "Online inquiry delivery is temporarily unavailable. Please use the email option below or call us directly.",
      },
      { status: 503 },
    );
  }

  const details = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone],
    ["Event date", date],
    ["Event type", eventType],
    ["Venue", venue],
    ["Experiences", experiences.join(", ") || "Help me choose"],
    ["Backdrop", backdrop],
    ["Hours", hours],
    ["Event details", notes],
  ] as const;
  const text = details.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<h1>New Strike A Pose inquiry</h1><dl>${details
    .map(
      ([label, value]) =>
        `<dt><strong>${escapeHtml(label)}</strong></dt><dd>${escapeHtml(value).replace(/\n/g, "<br />")}</dd>`,
    )
    .join("")}</dl>`;

  try {
    await sendEmail(apiKey, {
      from,
      to: [business.email],
      reply_to: email,
      subject: `New inquiry from ${name}`,
      html,
      text,
    });
    await sendEmail(apiKey, {
      from,
      to: [email],
      subject: "We received your Strike A Pose inquiry",
      html: `<p>Hi ${escapeHtml(name)},</p><p>Thank you for reaching out to Strike A Pose. We received your inquiry for ${escapeHtml(date)} and will be in touch soon to confirm availability and next steps.</p><p>Warmly,<br />Strike A Pose</p>`,
      text: `Hi ${name},\n\nThank you for reaching out to Strike A Pose. We received your inquiry for ${date} and will be in touch soon to confirm availability and next steps.\n\nWarmly,\nStrike A Pose`,
    });
  } catch (error) {
    console.error("Inquiry email delivery failed", error);
    return NextResponse.json(
      { message: "We could not send your inquiry. Please try again or use the email option below." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: "Your inquiry has been received. A confirmation email is on its way.",
  });
}
