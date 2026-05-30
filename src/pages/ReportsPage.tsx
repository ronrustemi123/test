import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import ReportCard from "../components/ReportCard";
import { supabase } from "../db/supabaseClient";
import type { Report, Status } from "../types/types";

const STATUS_OPTIONS: (Status | "all")[] = [
  "all", "Submitted", "Under Review", "In Progress", "Solved", "Rejected",
];

export default function ReportsPage() {
  const { t } = useTranslation();
  const routeLocation = useLocation();
  const justSubmitted = routeLocation.state?.submitted;

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sort, setSort] = useState("newest");
  const [showSheet, setShowSheet] = useState(false);
  const [showBanner, setShowBanner] = useState(!!justSubmitted);

  const SORT_OPTIONS = [
    { value: "newest", label: t("reports.sort_newest") },
    { value: "oldest", label: t("reports.sort_oldest") },
    { value: "most_voted", label: t("reports.sort_voted") },
    { value: "priority", label: t("reports.sort_priority") },
  ];

  useEffect(() => {
    supabase
      .from("reports")
      .select(`*, institutions (id, name)`)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setReports(data as Report[]);
        setLoading(false);
      });
  }, []);

  const filtered = reports
    .filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        (r.location_name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "most_voted") return b.upvotes - a.upvotes;
      if (sort === "priority") return (b.priority_score ?? 0) - (a.priority_score ?? 0);
      return 0;
    });

  const activeFilters = (statusFilter !== "all" ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {showBanner && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            <p className="text-sm font-medium text-green-800">{t("reports.submitted_banner")}</p>
          </div>
          <button onClick={() => setShowBanner(false)}>
            <X size={15} className="text-green-600" />
          </button>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-gray-900">{t("reports.title")}</h1>
            <button
              onClick={() => setShowSheet(true)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeFilters > 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <SlidersHorizontal size={13} />
              {t("reports.filter_sort")}
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("reports.search_placeholder")}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? t("reports.all") : t(`status.${s}`, { defaultValue: s })}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <p className="text-xs text-gray-400 font-medium">
          {loading
            ? t("reports.loading")
            : t(filtered.length === 1 ? "reports.count_one" : "reports.count_other", { count: filtered.length })}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-gray-900 mb-1">{t("reports.no_results_title")}</p>
            <p className="text-xs text-gray-400">{t("reports.no_results_body")}</p>
          </div>
        ) : (
          filtered.map((report) => <ReportCard key={report.id} report={report} />)
        )}
      </div>

      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSheet(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10">
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">{t("reports.filter_sort")}</h3>
              <button onClick={() => setShowSheet(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2.5">{t("reports.sort_by")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSort(value)}
                      className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition-colors ${
                        sort === value
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2.5">{t("reports.status_label")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition-colors ${
                        statusFilter === s
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {s === "all" ? t("reports.all") : t(`status.${s}`, { defaultValue: s })}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setStatusFilter("all"); setSort("newest"); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {t("reports.reset")}
                </button>
                <button
                  onClick={() => setShowSheet(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  {t("reports.apply")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
