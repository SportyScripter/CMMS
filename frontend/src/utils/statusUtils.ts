export const STATUS_COLORS = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-300",
  red: "bg-red-100 text-red-800 border-red-300",
  orange: "bg-orange-100 text-orange-800 border-orange-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  gray: "bg-gray-100 text-gray-800 border-gray-300",
};

// ONE configuration place for statuses (Machines and Failures)
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

// Helper function protecting against errors (returns default gray if the status from the DB is unknown)
const getConfig = (status: string) =>
  STATUS_CONFIG[status?.toUpperCase()] || {
    label: status,
    color: STATUS_COLORS.gray,
    rowBg: "bg-white",
    rowHover: "hover:bg-gray-50",
  };

// Wrappers (one-liners)!
export const translateStatus = (status: string) => getConfig(status).label;
export const getStatusBadgeStyle = (status: string) => getConfig(status).color;

// Now the row takes both the background color and the hover accent straight from the dictionary!
export const getStatusRowStyle = (status: string) => {
  const cfg = getConfig(status);
  return `${cfg.rowBg} ${cfg.rowHover}`;
};

export const CALENDAR_CONFIG: Record<string, { label: string; color: string }> =
  {
    COMPLETED: { label: "Wykonane", color: STATUS_COLORS.emerald },
    IN_PROGRESS: { label: "W trakcie", color: STATUS_COLORS.blue }, 
    UN_COMPLETED: { label: "Nieukończone", color: STATUS_COLORS.red },
    SCHEDULED: { label: "Zaplanowane", color: STATUS_COLORS.gray },
  };

// Helper function for the calendar
const getCalendarConfig = (status: string) =>
  CALENDAR_CONFIG[status?.toUpperCase()] || {
    label: status || "Zaplanowane",
    color: STATUS_COLORS.gray,
  };

// 1. Translation wrapper (one-liner!)
export const translateCalendarStatus = (status: string) =>
  getCalendarConfig(status).label;

// 2. Color wrapper (with dynamic checking for "today's" date)
export const getCalendarBadgeStyle = (
  status: string,
  scheduledDate?: string,
) => {
  const normalizedStatus = status?.toUpperCase() || "SCHEDULED";

  // Logic injection: If it is "Scheduled" and falls on today, force red!
  if (normalizedStatus === "SCHEDULED" && scheduledDate) {
    const today = new Date();
    const date = new Date(scheduledDate);
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return STATUS_COLORS.red;
    }
  }

  // In any other case, we take the color straight from the dictionary
  return getCalendarConfig(status).color;
};

// --- PRIORITY ----
export const translatePriority = (priority: string) => {
  switch (priority) {
    case 'low': return 'Niski';
    case 'normal': return 'Normalny';
    case 'high': return 'Wysoki';
    default: return priority || 'Normalny';
  }
};

export const getPriorityBadgeStyle = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'normal': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'high': return 'bg-red-600 text-white border-red-700';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};