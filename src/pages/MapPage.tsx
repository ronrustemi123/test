import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { divIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../components/StatusBadge";
import { supabase } from "../db/supabaseClient";
import type { Report } from "../types/types";
import "leaflet/dist/leaflet.css";

const urgencyColor: Record<string, string> = {
  Low: "#8087f0",
  Medium: "#BA7517",
  High: "#A32D2D",
};

function PinIcon({ urgency }: { urgency: string }) {
  const color = urgencyColor[urgency] ?? "#888780";
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16C0 27 16 40 16 40C16 40 32 27 32 16C32 7.16 24.84 0 16 0Z" fill={color} />
      <circle cx="16" cy="16" r="7" fill="white" />
    </svg>
  );
}

function makeIcon(urgency: string) {
  const svg = renderToStaticMarkup(<PinIcon urgency={urgency} />);
  return divIcon({ html: svg, className: "", iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -44] });
}

export default function MapPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Report | null>(null);

  const FILTERS = [
    t("reports.all"),
    t("status.Submitted"),
    t("status.Under Review"),
    t("status.In Progress"),
    t("status.Solved"),
  ];

  // Map translated filter label back to DB value for filtering
  const STATUS_MAP: Record<string, string> = {
    [t("status.Submitted")]: "Submitted",
    [t("status.Under Review")]: "Under Review",
    [t("status.In Progress")]: "In Progress",
    [t("status.Solved")]: "Solved",
  };

  useEffect(() => {
    supabase
      .from("reports")
      .select("id, title, description, category, status, urgency, location_name, latitude, longitude, image_url, upvotes, safety_related")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .then(({ data }) => {
        if (data) setReports(data as Report[]);
      });
  }, []);

  const filtered = filter === t("reports.all")
    ? reports
    : reports.filter((r) => r.status === STATUS_MAP[filter]);

  return (
    <div className="relative h-[calc(100dvh-67.5px)] w-full overflow-hidden">

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-900">{t("map.title")}</h1>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              showFilters || filter !== t("reports.all")
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <SlidersHorizontal size={13} />
            {filter === t("reports.all") ? t("map.filter") : filter}
          </button>
        </div>

        {showFilters && (
          <div className="max-w-lg mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setShowFilters(false); }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={[42.0062, 20.9698]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((report) =>
          report.latitude && report.longitude ? (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={makeIcon(report.urgency ?? "Low")}
              eventHandlers={{ click: () => setSelected(report) }}
            />
          ) : null
        )}
      </MapContainer>

      {/* Urgency legend */}
      <div className="absolute bottom-6 left-4 z-30 bg-white rounded-xl border border-gray-100 px-3 py-2.5 space-y-1.5">
        {Object.entries(urgencyColor).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-600">
              {t(`urgency.${level}`, { defaultValue: level })}
            </span>
          </div>
        ))}
      </div>

      {/* Report count */}
      <div className="absolute bottom-6 right-4 z-30 bg-white rounded-xl border border-gray-100 px-3 py-2">
        <span className="text-xs font-semibold text-gray-700">
          {t("map.reports_count", { count: filtered.length })}
        </span>
      </div>

      {/* Selected report sheet */}
      {selected && (
        <div className="absolute bottom-16 left-0 right-0 z-30 px-3 pb-3">
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              {selected.image_url && (
                <img src={selected.image_url} alt={selected.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{selected.title}</p>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <StatusBadge status={selected.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{selected.location_name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
