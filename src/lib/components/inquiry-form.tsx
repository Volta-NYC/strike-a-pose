"use client";
import { useEffect, useState } from "react";
import { business, packages } from "@/lib/site-data";
export default function InquiryForm() {
  const [experience, setExperience] = useState("");
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [earliest, setEarliest] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setExperience(q.get("experience") || "");
    if (q.has("backdrop")) setNotes(`Preferred backdrop: ${q.get("backdrop")}`);
    const now = new Date();
    setEarliest(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    );
  }, []);
  return (
    <form
      className="inquiry-form"
      onChange={() => {
        setDraft("");
        setCopied(false);
        setCopyError(false);
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body = `Hello Strike A Pose,\n\nI would like to request a quote for my event.\n\nName: ${f.get("name")}\nEmail: ${f.get("email")}\nPhone: ${f.get("phone") || "Not provided"}\nEvent date: ${f.get("date")}\nEvent type: ${f.get("type")}\nVenue / city: ${f.get("venue")}\nExperience: ${packages.find((p) => p.id === f.get("experience"))?.name || ({ "red-carpet": "VIP Red Carpet Experience", marquee: "Illuminated Marquee Numbers", "add-ons": "Event add-ons / multiple experiences" } as Record<string, string>)[String(f.get("experience"))] || "Help me choose"}\nHours: ${f.get("hours")}\n\nEvent details:\n${f.get("notes") || "None added"}\n\nThank you!`;
        setDraft(body);
      }}
    >
      <h2>Tell us about your event</h2>
      <p>
        Fields marked * are required. Your date is confirmed personally by our
        team.
      </p>
      <div className="form-grid">
        <label>
          Your name *
          <input name="name" required autoComplete="name" maxLength={100} />
        </label>
        <label>
          Email address *
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
          />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
        <label>
          Event date *<input name="date" type="date" min={earliest} required />
        </label>
        <label>
          Event type *
          <select name="type" required defaultValue="">
            <option value="" disabled>
              Select an event
            </option>
            {[
              "Wedding",
              "Birthday",
              "Sweet 16",
              "Graduation",
              "Baby shower",
              "Corporate event",
              "School event",
              "Other celebration",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Venue / city *<input name="venue" required maxLength={200} />
        </label>
        <label>
          Preferred experience
          <select
            name="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">Help me choose</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="red-carpet">VIP Red Carpet Experience</option>
            <option value="marquee">Illuminated Marquee Numbers</option>
            <option value="add-ons">
              Event add-ons / multiple experiences
            </option>
          </select>
        </label>
        <label>
          Hours
          <select name="hours" defaultValue="Not sure yet">
            <option>2 Hours</option>
            <option>3 Hours</option>
            <option>4 Hours</option>
            <option>Not sure yet</option>
          </select>
        </label>
        <label className="wide">
          Anything else we should know?
          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Guest count, theme, preferred backdrop, or add-ons…"
          />
        </label>
      </div>
      <p className="form-note">
        This form prepares an email for you to send to {business.email}. It does
        not submit or reserve your date automatically.
      </p>
      <button type="submit" className="button gold">
        Prepare My Inquiry ↗
      </button>
      {draft && (
        <section className="draft-panel" aria-label="Your inquiry email">
          <h3>Your inquiry is ready</h3>
          <p role="status">
            Open your email app to review and send it, or copy the details into
            an email to{" "}
            <a href={`mailto:${business.email}`}>{business.email}</a>.
          </p>
          <div className="button-row">
            <a
              className="button gold"
              href={`mailto:${business.email}?subject=${encodeURIComponent("Event inquiry | Strike A Pose")}&body=${encodeURIComponent(draft)}`}
            >
              Open Email Draft ↗
            </a>
            <button
              type="button"
              className="button copy-button"
              onClick={async () => {
                try {
                  setCopyError(false);
                  await navigator.clipboard.writeText(draft);
                  setCopied(true);
                } catch {
                  setCopied(false);
                  setCopyError(true);
                }
              }}
            >
              {copied ? "Copied" : "Copy Inquiry"}
            </button>
          </div>
          {copyError && (
            <p role="status">
              Copy is unavailable in this browser. Open “Review your inquiry”
              below to select and copy the text.
            </p>
          )}
          <details>
            <summary>Review your inquiry</summary>
            <pre>{draft}</pre>
          </details>
        </section>
      )}
    </form>
  );
}
