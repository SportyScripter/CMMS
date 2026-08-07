/**
 * Calculates the downtime duration between the creation time and now (or end time).
 * Returns a human-readable string, e.g., "2d 4h 15m" or "45m".
 */

const ensureUtc = (dateStr: string): string => {
  if (!dateStr) return dateStr;
  return dateStr.endsWith("Z") || dateStr.includes("+")
    ? dateStr
    : `${dateStr}Z`;
};

export const calculateDowntime = (
  startDateStr: string,
  endDateStr?: string | null,
): string => {
  const start = new Date(ensureUtc(startDateStr)).getTime();
  const end = endDateStr
    ? new Date(ensureUtc(endDateStr)).getTime()
    : new Date().getTime();

  const diffMs = end - start;

  if (diffMs <= 0) return "0m";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMins / (60 * 24));
  const hours = Math.floor((diffMins % (60 * 24)) / 60);
  const minutes = diffMins % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};
