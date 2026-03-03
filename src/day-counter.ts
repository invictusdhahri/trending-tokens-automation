/**
 * Day count for the "Day X of posting" series.
 * Uses date-based calculation so it works in GitHub Actions (ephemeral runners).
 * Day 1 = START_DATE, Day 2 = next day, etc.
 */
const START_DATE = new Date('2026-03-03'); // First run date

function getDaysSinceStart(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(START_DATE);
  start.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getDayCount(): number {
  return getDaysSinceStart() + 1;
}

export function incrementDayCount(): number {
  return getDayCount();
}
