"use client";
import { useEffect, useState } from "react";
import { backdrops, business, packages } from "@/lib/site-data";

const experienceOptions = [
  ...packages.map(({ id, name }) => ({ id, name })),
  { id: "red-carpet", name: "VIP Red Carpet Experience" },
  { id: "marquee", name: "Illuminated Marquee Numbers" },
];

type Submission = {
  status: "idle" | "sending" | "success" | "error";
  message: string;
};

export default function InquiryForm() {
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [eventType, setEventType] = useState("");
  const [backdrop, setBackdrop] = useState("");
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [earliest, setEarliest] = useState("");
  const [submission, setSubmission] = useState<Submission>({
    status: "idle",
    message: "",
  });
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const requestedExperience = q.get("experience");
    setSelectedExperiences(
      experienceOptions.some(({ id }) => id === requestedExperience)
        ? [requestedExperience as string]
        : [],
    );
    setBackdrop(q.get("backdrop") || "");
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
        if (submission.status !== "idle") {
          setSubmission({ status: "idle", message: "" });
        }
      }}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const f = new FormData(form);
        const selectedExperienceNames = f
          .getAll("experiences")
          .map(
            (id) =>
              experienceOptions.find((experience) => experience.id === id)
                ?.name,
          )
          .filter((name): name is string => Boolean(name));
        const celebrationDetail = f.get("celebrationDetail");
        const eventTypeDetail =
          f.get("type") === "Other Celebrations" && celebrationDetail
            ? `Other Celebrations: ${celebrationDetail}`
            : f.get("type");
        const body = `Hello Strike A Pose,\n\nI would like to request a quote for my event.\n\nName: ${f.get("name")}\nEmail: ${f.get("email")}\nPhone: ${f.get("phone") || "Not provided"}\nEvent date: ${f.get("date")}\nEvent type: ${eventTypeDetail}\nVenue name & full address: ${f.get("venue")}\nExperiences: ${selectedExperienceNames.join(", ") || "Help me choose"}\nBackdrop: ${f.get("backdrop") || "Help me choose"}\nHours: ${f.get("hours")}\n\nEvent details:\n${f.get("notes") || "None added"}\n\nThank you!`;
        setDraft(body);
        setSubmission({ status: "sending", message: "" });

        try {
          const response = await fetch("/api/inquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: f.get("name"),
              email: f.get("email"),
              phone: f.get("phone"),
              date: f.get("date"),
              eventType: eventTypeDetail,
              venue: f.get("venue"),
              experiences: selectedExperienceNames,
              backdrop: f.get("backdrop"),
              hours: f.get("hours"),
              notes: f.get("notes"),
              website: f.get("website"),
            }),
          });
          const result = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;

          if (!response.ok) {
            throw new Error(result?.message || "We could not send your inquiry.");
          }

          setSubmission({
            status: "success",
            message:
              result?.message ||
              "Your inquiry has been received and a confirmation email is on its way.",
          });
          form.reset();
          setSelectedExperiences([]);
          setEventType("");
          setBackdrop("");
          setNotes("");
        } catch (error) {
          setSubmission({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "We could not send your inquiry.",
          });
        }
      }}
    >
      <h2>Tell us about your event</h2>
      <p>
        Fields marked * are required. Our team will personally confirm your
        event date.
      </p>
      <div className="form-grid">
        <label className="form-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
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
          <select
            name="type"
            required
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="" disabled>
              Select an event
            </option>
            {[
              "Wedding",
              "Birthday",
              "Sweet 16",
              "Bar or Bat Mitzvah",
              "Graduation",
              "Baby shower",
              "Corporate event",
              "School event",
              "Other Celebrations",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {eventType === "Other Celebrations" && (
          <label className="wide">
            What are you celebrating? *
            <input
              name="celebrationDetail"
              required
              maxLength={200}
              placeholder="Tell us about your celebration"
            />
          </label>
        )}
        <label className="venue-field">
          Venue Name &amp; Full Address *
          <span className="field-help" id="venue-help">
            Please enter the venue name and complete event address, including
            the city.
          </span>
          <input
            name="venue"
            required
            maxLength={200}
            placeholder="Venue name, street address, city"
            aria-describedby="venue-help"
          />
        </label>
        <fieldset className="wide service-options">
          <legend>Preferred Experience(s) — Select all that apply</legend>
          <div className="service-options-grid">
            {experienceOptions.map(({ id, name }) => (
              <label key={id}>
                <input
                  type="checkbox"
                  name="experiences"
                  value={id}
                  checked={selectedExperiences.includes(id)}
                  onChange={() =>
                    setSelectedExperiences((current) =>
                      current.includes(id)
                        ? current.filter((selectedId) => selectedId !== id)
                        : [...current, id],
                    )
                  }
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          Hours *
          <select name="hours" defaultValue="" required>
            <option value="" disabled>Select number of hours</option>
            <option>2 Hours</option>
            <option>3 Hours</option>
            <option>4 Hours</option>
            <option>5 Hours</option>
            <option>6 Hours</option>
          </select>
        </label>
        <label>
          Preferred backdrop
          <select
            name="backdrop"
            value={backdrop}
            onChange={(e) => setBackdrop(e.target.value)}
          >
            <option value="">Help me choose</option>
            {backdrops.map(([name]) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
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
      <p className="media-release">
        Strike A Pose may use event photos and videos for marketing and promotional purposes.
      </p>
      <p className="form-note">
        We’ll email you a confirmation after your inquiry is received. Sending an
        inquiry does not reserve your date.
      </p>
      <button
        type="submit"
        className="button gold"
        disabled={submission.status === "sending"}
      >
        {submission.status === "sending" ? "Sending inquiry…" : "Send My Inquiry ↗"}
      </button>
      {submission.status === "success" && (
        <section className="draft-panel inquiry-success" aria-live="polite">
          <h3>Thank you, we have your inquiry.</h3>
          <p>{submission.message}</p>
          <p>
            A member of the Strike A Pose team will be in touch about your event
            date and next steps.
          </p>
        </section>
      )}
      {draft && submission.status === "error" && (
        <section className="draft-panel" aria-label="Your inquiry email">
          <h3>Let’s make sure your inquiry reaches us</h3>
          <p role="status">
            {submission.message} You can still open a pre-filled email or copy
            the details to{" "}
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
