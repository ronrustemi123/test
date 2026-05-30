import type { Urgency } from "../types/types";

const urgencyConfig: Record<Urgency, { bg: string; text: string }> = {
  Low:    { bg: "bg-gray-100",   text: "text-gray-600"  },
  Medium: { bg: "bg-blue-50",    text: "text-blue-700"  },
  High:   { bg: "bg-red-50",     text: "text-red-700"   },
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const cfg = urgencyConfig[urgency];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {urgency}
    </span>
  );
}
