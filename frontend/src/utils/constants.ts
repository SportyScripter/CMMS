export const TRANSACTION_TYPES: Record<
  string,
  { label: string; color: string }
> = {
  FAILURE: {
    label: "Zużycie (Awaria)",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  DELIVERY: {
    label: "Dostawa",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  MANUAL_DISPATCH: {
    label: "Pobranie ręczne",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  RETURN: {
    label: "Zwrot",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  ADJUSTMENT: {
    label: "Korekta stanu",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
};
