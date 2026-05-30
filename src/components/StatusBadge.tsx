import type { Status } from "../types/types";

const statusConfig: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  Submitted:     { label: "Submitted",    bg: "bg-blue-50",   text: "text-blue-800",  dot: "bg-blue-500"  },
  "Under Review":{ label: "Under Review", bg: "bg-gray-100",  text: "text-gray-700",  dot: "bg-gray-400"  },
  "In Progress": { label: "In Progress",  bg: "bg-amber-50",  text: "text-amber-800", dot: "bg-amber-500" },
  Solved:        { label: "Solved",       bg: "bg-green-50",  text: "text-green-800", dot: "bg-green-500" },
  Rejected:      { label: "Rejected",     bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-500"   },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
