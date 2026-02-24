#!/usr/bin/env node
import fs from "node:fs";

const path = process.argv[2] || "events.json";

function parseDateTime(event) {
  const dateISO = String(event?.dateISO || "");
  const timeText = String(event?.time || "9:00 AM");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return Number.NaN;
  const [clock = "9:00", meridiem = "AM"] = timeText.split(" ");
  let [hour, minute] = clock.split(":").map(Number);
  if (!Number.isFinite(hour)) hour = 9;
  if (!Number.isFinite(minute)) minute = 0;
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  const dt = new Date(`${dateISO}T00:00:00`);
  dt.setHours(hour, minute, 0, 0);
  return dt.getTime();
}

function run() {
  const raw = fs.readFileSync(path, "utf8");
  const payload = JSON.parse(raw);
  const slots = Array.isArray(payload?.slots) ? payload.slots : [];
  const walks = Array.isArray(payload?.monthlyWalks) ? payload.monthlyWalks : [];
  const all = [
    ...slots.map((e) => ({ ...e, kind: "assessment" })),
    ...walks.map((e) => ({ ...e, kind: "hillwalk" }))
  ];

  const errors = [];
  const warnings = [];
  const seenIds = new Set();

  all.forEach((event) => {
    const id = Number(event?.id);
    if (!Number.isFinite(id)) {
      errors.push("Event missing numeric id.");
      return;
    }
    if (seenIds.has(id)) errors.push(`Duplicate event id ${id}.`);
    seenIds.add(id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(event?.dateISO || ""))) {
      errors.push(`Event ${id} has invalid dateISO.`);
    }
    if (event.kind === "hillwalk" && !String(event?.skill || "").trim()) {
      errors.push(`Hill walk ${id} missing skill.`);
    }
    if (typeof event.waitlistOnly !== "boolean") {
      warnings.push(`Event ${id} missing waitlistOnly flag.`);
    }
  });

  const sorted = [...all].sort((a, b) => parseDateTime(a) - parseDateTime(b));
  const outOfOrder = all.some((event, idx) => Number(event?.id) !== Number(sorted[idx]?.id));
  if (outOfOrder) warnings.push("Events are not in chronological order in source JSON.");

  if (warnings.length) {
    console.log("Warnings:");
    warnings.forEach((w) => console.log(`- ${w}`));
  }
  if (errors.length) {
    console.error("Errors:");
    errors.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }
  console.log("events-lint: OK");
}

run();
