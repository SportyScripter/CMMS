import { ensureUtc } from "./dateUtils";

export const STATUS_COLORS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-300",
  red: "bg-red-100 text-red-800 border-red-300",
  orange: "bg-orange-100 text-orange-800 border-orange-300",
  amber: "bg-amber-100 text-amber-800 border-amber-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  teal: "bg-teal-100 text-teal-800 border-teal-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  gray: "bg-gray-100 text-gray-800 border-gray-300",
  slate: "bg-slate-100 text-slate-700 border-slate-300",
};

// Centralized configuration for Machine and Failure statuses
export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; rowBg: string; rowHover: string }
> = {
  OPERATIONAL: {
    label: "Sprawna",
    color: STATUS_COLORS.emerald,
    rowBg: "bg-emerald-50/40",
    rowHover: "hover:bg-emerald-100/60",
  },
  CRITICAL: {
    label: "Awaria",
    color: STATUS_COLORS.red,
    rowBg: "bg-red-50/70",
    rowHover: "hover:bg-red-100/80",
  },
  WARNING: {
    label: "Utrudniona produkcja",
    color: STATUS_COLORS.orange,
    rowBg: "bg-orange-50/60",
    rowHover: "hover:bg-orange-100/70",
  },
  IN_PROGRESS: {
    label: "W trakcie naprawy",
    color: STATUS_COLORS.blue,
    rowBg: "bg-blue-50/60",
    rowHover: "hover:bg-blue-100/70",
  },
  WAITING_FOR_PARTS: {
    label: "Oczekiwanie na części",
    color: STATUS_COLORS.purple,
    rowBg: "bg-purple-50/60",
    rowHover: "hover:bg-purple-100/70",
  },
  WAITING_FOR_SERVICE: {
    label: "Oczekiwanie na serwis zew.",
    color: STATUS_COLORS.purple,
    rowBg: "bg-purple-50/60",
    rowHover: "hover:bg-purple-100/70",
  },
  ACCEPTED: {
    label: "Zgłoszenie przyjęte",
    color: STATUS_COLORS.indigo,
    rowBg: "bg-indigo-50/60",
    rowHover: "hover:bg-indigo-100/70",
  },
  PENDING: {
    label: "Oczekujące (Nowe)",
    color: STATUS_COLORS.yellow,
    rowBg: "bg-yellow-50/60",
    rowHover: "hover:bg-yellow-100/70",
  },
  MAINTENANCE: {
    label: "W trakcie przeglądu",
    color: STATUS_COLORS.indigo,
    rowBg: "bg-indigo-50/60",
    rowHover: "hover:bg-indigo-100/70",
  },
  MAINTENANCE_ON_HOLD: {
    label: "Wstrzymany przegląd",
    color: STATUS_COLORS.slate,
    rowBg: "bg-slate-50/60",
    rowHover: "hover:bg-slate-100/70",
  },
  RESOLVED: {
    label: "Zakończone",
    color: STATUS_COLORS.emerald,
    rowBg: "bg-emerald-50/40",
    rowHover: "hover:bg-emerald-100/60",
  },
  CLOSE: {
    label: "Zamknięte",
    color: STATUS_COLORS.gray,
    rowBg: "bg-gray-50/50",
    rowHover: "hover:bg-gray-100",
  },
  OFF: {
    label: "Wyłączona",
    color: "bg-gray-100 border-gray-300 text-gray-600 grayscale opacity-90",
    rowBg: "bg-gray-50",
    rowHover: "hover:bg-gray-100",
  },
};

/**
 * Helper function protecting against errors.
 * Returns default gray configuration if the status from the DB is unknown.
 */
const getConfig = (status: string) =>
  STATUS_CONFIG[status?.toUpperCase()] || {
    label: status,
    color: STATUS_COLORS.gray,
    rowBg: "bg-white",
    rowHover: "hover:bg-gray-50",
  };

// Status translation and styling wrappers
export const translateStatus = (status: string) => getConfig(status).label;
export const getStatusBadgeStyle = (status: string) => getConfig(status).color;

/**
 * Returns combined row background and hover styles based on the status dictionary.
 */
export const getStatusRowStyle = (status: string) => {
  const cfg = getConfig(status);
  return `${cfg.rowBg} ${cfg.rowHover}`;
};

export const CALENDAR_CONFIG: Record<string, { label: string; color: string }> =
  {
    COMPLETED: { label: "Wykonane", color: STATUS_COLORS.emerald },
    IN_PROGRESS: { label: "W trakcie", color: STATUS_COLORS.blue },
    PAUSED: { label: "Wstrzymane", color: STATUS_COLORS.slate },
    UN_COMPLETED: { label: "Nieukończone", color: STATUS_COLORS.red },
    SCHEDULED: { label: "Zaplanowane", color: STATUS_COLORS.gray },
  };

/**
 * Helper function for calendar statuses.
 */
const getCalendarConfig = (status: string) =>
  CALENDAR_CONFIG[status?.toUpperCase()] || {
    label: status || "Zaplanowane",
    color: STATUS_COLORS.gray,
  };

export const translateCalendarStatus = (status: string) =>
  getCalendarConfig(status).label;

/**
 * Returns badge style for calendar items.
 * Forces red color if a scheduled task falls on today's date.
 */
export const getCalendarBadgeStyle = (
  status: string,
  scheduledDate?: string,
) => {
  const normalizedStatus = status?.toUpperCase() || "SCHEDULED";

  if (normalizedStatus === "SCHEDULED" && scheduledDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(ensureUtc(scheduledDate));
    date.setHours(0, 0, 0, 0);

    if (date.getTime() <= today.getTime()) {
      return STATUS_COLORS.red;
    }
  }

  return getCalendarConfig(status).color;
};

// --- PRIORITY CONFIGURATION ---
export const translatePriority = (priority: string) => {
  switch (priority) {
    case "low":
      return "Niski";
    case "normal":
      return "Normalny";
    case "high":
      return "Wysoki";
    default:
      return priority || "Normalny";
  }
};

export const getPriorityBadgeStyle = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "normal":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "high":
      return "bg-red-600 text-white border-red-700";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// --- DURATION CALCULATOR ---
/**
 * Calculates the total elapsed time between a start and end date.
 * Formats the output to minutes or hours/minutes depending on the total duration.
 */
export const calculateDuration = (
  start?: string | null,
  end?: string | null,
) => {
  if (!start || !end) return "Brak danych";

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const diffInMinutes = Math.floor((endTime - startTime) / (1000 * 60));

  if (diffInMinutes < 0) return "Błąd czasu";
  if (diffInMinutes < 60) return `${diffInMinutes} min`;

  const hours = Math.floor(diffInMinutes / 60);
  const mins = diffInMinutes % 60;
  return `${hours}h ${mins}m`;
};
