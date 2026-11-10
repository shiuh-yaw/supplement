import type { RecommendationResult } from "@supplement/engine";
import { APP_NAME } from "./site";

/**
 * Builds an .ics calendar file with repeating reminders for the recommended
 * supplements. Works with Google Calendar, Apple Calendar and Outlook on any
 * phone — no app, push server or account needed.
 */
const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildReminderIcs(result: RecommendationResult, time = "08:00", start = new Date()): string | null {
  const recommended = result.items.filter((i) => i.status === "recommended" && i.dose);
  const daily = recommended.filter((i) => i.dose!.schedule === "daily");
  const alternate = recommended.filter((i) => i.dose!.schedule === "every_other_day");
  if (daily.length === 0 && alternate.length === 0) return null;

  const [hh, mm] = time.split(":");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const day = icsDate(start);

  const event = (uid: string, title: string, items: typeof recommended, rrule: string) =>
    [
      "BEGIN:VEVENT",
      `UID:${uid}-${day}@sukat`,
      `DTSTAMP:${stamp}`,
      // Floating local time: fires at this time wherever the phone is.
      `DTSTART:${day}T${hh}${mm}00`,
      "DURATION:PT5M",
      `RRULE:${rrule}`,
      `SUMMARY:${escape(title)}`,
      `DESCRIPTION:${escape(items.map((i) => `${i.supplement.name}: ${i.dose!.text}`).join("\n"))}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escape(title)}`,
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");

  const events: string[] = [];
  if (daily.length) {
    events.push(event("daily", `Take: ${daily.map((i) => i.supplement.name).join(", ")}`, daily, "FREQ=DAILY"));
  }
  if (alternate.length) {
    events.push(
      event("alternate", `Take (every other day): ${alternate.map((i) => i.supplement.name).join(", ")}`, alternate, "FREQ=DAILY;INTERVAL=2"),
    );
  }
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${APP_NAME}//Supplement reminders//EN`,
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
