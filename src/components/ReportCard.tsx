import type { Report } from "../types";

type ReportCardProps = {
  report: Report;
};

function ReportCard({ report }: ReportCardProps) {
  const statusClass =
    report.status === "Solved"
      ? "bg-green-400/15 text-green-300"
      : report.status === "Pending"
      ? "bg-yellow-400/15 text-yellow-300"
      : "bg-sky-400/15 text-sky-300";

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/10 p-4">
      <div>
        <h4 className="font-bold">{report.title}</h4>
        <p className="text-sm text-slate-400 mt-1">{report.location}</p>
      </div>

      <span
        className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-extrabold ${statusClass}`}
      >
        {report.status}
      </span>
    </div>
  );
}

export default ReportCard;