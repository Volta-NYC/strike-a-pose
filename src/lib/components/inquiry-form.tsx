"use client";
import { useEffect, useRef, useState } from "react";
import { backdrops, business } from "@/lib/site-data";
import {
  earliestEventDate,
  eventTypes,
  experienceOptions,
  hourOptions,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactResponse,
} from "@/lib/contact";

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
  const [fieldErrors, setFieldErrors] = useState<ContactErrors>({});
  const errorSummary = useRef<HTMLElement>(null);
  const sending = useRef(false);
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
    setEarliest(earliestEventDate());
  }, []);
  useEffect(() => {
    if (Object.keys(fieldErrors).length) errorSummary.current?.focus();
  }, [fieldErrors]);

  const fieldProps = (field: ContactField, description?: string) => ({
    id: `contact-${field}`,
    "aria-invalid": fieldErrors[field] ? true as const : undefined,
    "aria-describedby": [description, fieldErrors[field] ? `contact-${field}-error` : ""].filter(Boolean).join(" ") || undefined,
  });
  return (
    <form
      className="inquiry-form"
      aria-busy={submission.status === "sending"}
      onChange={() => {
        setDraft("");
        setCopied(false);
        setCopyError(false);
        setFieldErrors({});
        if (submission.status === "error" || submission.status === "success") {
          setSubmission({ status: "idle", message: "" });
        }
      }}
      onSubmit={async (event) => {
        event.preventDefault();
        if (sending.current) return;
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
        const payload = {
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone"),
          date: f.get("date"),
          eventType: f.get("type"),
          celebrationDetail: celebrationDetail || "",
          venue: f.get("venue"),
          experiences: selectedExperienceNames,
          backdrop: f.get("backdrop") || "",
          hours: f.get("hours"),
          notes: f.get("notes"),
        };
        const validation = validateContact(payload);
        if (!validation.valid) {
          setFieldErrors(validation.errors);
          setSubmission({ status: "idle", message: "" });
          return;
        }
        setFieldErrors({});
        const body = `Hello Strike A Pose,\n\nI would like to request a quote for my event.\n\nName: ${f.get("name")}\nEmail: ${f.get("email")}\nPhone: ${f.get("phone")}\nEvent date: ${f.get("date")}\nEvent type: ${eventTypeDetail}\nVenue name & full address: ${f.get("venue")}\nExperiences: ${selectedExperienceNames.join(", ") || "Help me choose"}\nBackdrop: ${f.get("backdrop") || "Help me choose"}\nHours: ${f.get("hours")}\n\nEvent details:\n${f.get("notes") || "None added"}\n\nThank you!`;
        setDraft(body);
        sending.current = true;
        setSubmission({ status: "sending", message: "" });

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...validation.data,
              website: f.get("website"),
            }),
          });
          const result = (await response.json().catch(() => null)) as
            | ContactResponse
            | null;

          if (!response.ok) {
            if (result?.errors && Object.keys(result.errors).length) {
              setFieldErrors(result.errors);
              setSubmission({ status: "idle", message: "" });
              return;
            }
            throw new Error(result?.message || "We could not send your inquiry.");
          }
          if (!result?.message) throw new Error("We could not confirm delivery of your inquiry. Please use the email option below or call us directly.");

          setSubmission({
            status: "success",
            message: result.message,
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
        } finally {
          sending.current = false;
        }
      }}
    >
      <h2>Tell us about your event</h2>
      <p>
        Fields marked * are required. Our team will personally confirm your
        event date.
      </p>
      {Object.keys(fieldErrors).length > 0 && (
        <section className="form-errors" ref={errorSummary} tabIndex={-1} role="alert" aria-labelledby="contact-errors-title">
          <h3 id="contact-errors-title">Please check your inquiry</h3>
          <ul>
            {Object.entries(fieldErrors).map(([field, message]) => (
              <li key={field} id={`contact-${field}-error`}>
                <a href={`#contact-${field}`} onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(`contact-${field}`)?.focus();
                }}>{message}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <fieldset className="form-grid" disabled={submission.status === "sending"} aria-label="Event details">
        <label className="form-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          Your name *
          <input {...fieldProps("name")} name="name" required autoComplete="name" maxLength={100} />
        </label>
        <label>
          Email address *
          <input
            {...fieldProps("email")}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
          />
        </label>
        <label>
          Phone number *
          <input {...fieldProps("phone")} name="phone" type="tel" required autoComplete="tel" maxLength={40} />
        </label>
        <label>
          Event date *<input {...fieldProps("date")} name="date" type="date" min={earliest} required />
        </label>
        <label>
          Event type *
          <select
            {...fieldProps("eventType")}
            name="type"
            required
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="" disabled>
              Select an event
            </option>
            {eventTypes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {eventType === "Other Celebrations" && (
          <label className="wide">
            What are you celebrating? *
            <input
              {...fieldProps("celebrationDetail")}
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
            {...fieldProps("venue", "venue-help")}
            name="venue"
            required
            maxLength={200}
            placeholder="Venue name, street address, city"
          />
        </label>
        <fieldset {...fieldProps("experiences")} tabIndex={-1} className="wide service-options">
          <legend>Preferred Experience(s), select all that apply</legend>
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
          <select {...fieldProps("hours")} name="hours" defaultValue="" required>
            <option value="" disabled>Select number of hours</option>
            {hourOptions.map((hours) => <option key={hours}>{hours}</option>)}
          </select>
        </label>
        <label>
          Preferred backdrop
          <select
            {...fieldProps("backdrop")}
            name="backdrop"
            value={backdrop}
            onChange={(e) => setBackdrop(e.target.value)}
          >
            <option value="" disabled>Select a backdrop</option>
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
            {...fieldProps("notes")}
            name="notes"
            rows={4}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Guest count, theme, preferred backdrop, or add-ons…"
          />
        </label>
      </fieldset>
      <p className="media-release">
        Strike A Pose may use event photos and videos for marketing and promotional purposes.
      </p>
      <p className="form-note">
        Our team will contact you after reviewing your inquiry. Sending an inquiry
        does not reserve your date.
      </p>
      <button
        type="submit"
        className="button gold"
        disabled={submission.status === "sending"}
      >
        {submission.status === "sending" ? "Sending inquiry…" : "Send My Inquiry ↗"}
      </button>
      <p className="sr-only" role="status">
        {submission.status === "sending" ? "Sending your inquiry. Please wait." : ""}
      </p>
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
          <p role="alert">
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
