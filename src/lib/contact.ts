import { backdrops, packages } from "./site-data";

export const experienceOptions = [
  ...packages.map(({ id, name }) => ({ id, name })),
  { id: "red-carpet", name: "VIP Red Carpet Experience" },
  { id: "marquee", name: "Illuminated Marquee Numbers" },
];

export const eventTypes = [
  "Wedding",
  "Birthday",
  "Sweet 16",
  "Bar or Bat Mitzvah",
  "Graduation",
  "Baby shower",
  "Corporate event",
  "School event",
  "Other Celebrations",
];

export const hourOptions = ["2 Hours", "3 Hours", "4 Hours", "5 Hours", "6 Hours"];

export type ContactDetails = {
  name: string;
  email: string;
  phone: string;
  date: string;
  eventType: string;
  celebrationDetail: string;
  venue: string;
  experiences: string[];
  backdrop: string;
  hours: string;
  notes: string;
};

export type ContactField = keyof ContactDetails;
export type ContactErrors = Partial<Record<ContactField, string>>;
export type ContactResponse = { message: string; errors?: ContactErrors };

export function earliestEventDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function validateContact(input: Record<string, unknown>):
  | { valid: true; data: ContactDetails }
  | { valid: false; errors: ContactErrors } {
  const errors: ContactErrors = {};
  const text = (
    field: ContactField,
    label: string,
    maxLength: number,
    required = true,
  ) => {
    const value = input[field];
    if (value === undefined && !required) return "";
    if (typeof value !== "string") {
      errors[field] = `Please enter ${label}.`;
      return "";
    }
    const cleaned = value.trim();
    if (required && !cleaned) errors[field] = `Please enter ${label}.`;
    if (cleaned.length > maxLength) {
      errors[field] = `Please keep ${label} to ${maxLength} characters or fewer.`;
    }
    if (cleaned.includes("\0")) errors[field] = `Please enter valid text for ${label}.`;
    return cleaned;
  };

  const name = text("name", "your name", 100);
  const email = text("email", "your email address", 200).toLowerCase();
  const phone = text("phone", "your phone number", 40);
  const date = text("date", "your event date", 10);
  const eventType = text("eventType", "your event type", 30);
  const celebrationDetail = text("celebrationDetail", "your celebration details", 200, eventType === "Other Celebrations");
  const venue = text("venue", "the venue name and full address", 200);
  const backdrop = text("backdrop", "your preferred backdrop", 100, false);
  const hours = text("hours", "the number of hours", 40);
  const notes = text("notes", "your additional details", 2000, false);

  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address, such as name@example.com.";
  }
  const phoneDigits = phone.replace(/\D/g, "").length;
  if (!errors.phone && (!/^[\d\s()+.#ext-]+$/i.test(phone) || phoneDigits < 7 || phoneDigits > 20)) {
    errors.phone = "Please enter a valid phone number, including the area code.";
  }
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!errors.date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date)) {
    errors.date = "Please enter a real event date.";
  } else if (!errors.date && date < earliestEventDate()) {
    errors.date = "Please choose today or a future event date.";
  }
  if (!errors.eventType && !eventTypes.includes(eventType)) {
    errors.eventType = "Please select an event type from the list.";
  }
  if (!errors.hours && !hourOptions.includes(hours)) {
    errors.hours = "Please select between 2 and 6 hours.";
  }
  if (!errors.backdrop && backdrop && !backdrops.some(([name]) => name === backdrop)) {
    errors.backdrop = "Please select a backdrop from the list.";
  }

  const rawExperiences = input.experiences ?? [];
  const experiences: string[] = [];
  if (!Array.isArray(rawExperiences) || rawExperiences.length > experienceOptions.length) {
    errors.experiences = "Please choose experiences from the available options.";
  } else {
    for (const experience of rawExperiences) {
      if (typeof experience !== "string" || !experienceOptions.some(({ name }) => name === experience)) {
        errors.experiences = "Please choose experiences from the available options.";
      } else if (!experiences.includes(experience)) {
        experiences.push(experience);
      }
    }
  }

  if (Object.keys(errors).length) return { valid: false, errors };
  return {
    valid: true,
    data: { name, email, phone, date, eventType, celebrationDetail, venue, experiences, backdrop, hours, notes },
  };
}
