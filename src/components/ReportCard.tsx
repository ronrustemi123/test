import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MapPin, Clock, Shield } from "lucide-react";
import { supabase } from "../db/supabaseClient";
import { UrgencyBadge } from "./UrgencyBadge";
import { useTranslation } from "react-i18next";
import type { Report } from "../types/types";
import { getAnonId } from "../utils/generateId";
import type { TFunction } from "i18next";

function timeAgo(dateStr: string, t: TFunction) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 60)
    return t("reports.time_ago_minutes", { count: mins });

  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return t("reports.time_ago_hours", { count: hrs });

  return t("reports.time_ago_days", {
    count: Math.floor(hrs / 24),
  });
}

export default function ReportCard({ report }: { report: Report }) {
  const { t } = useTranslation();
  const anonId = getAnonId();

  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [voted, setVoted] = useState<"upvote" | "downvote" | null>(null);

  useEffect(() => {
    const loadVotes = async () => {
      const { data, error } = await supabase
        .from("report_votes")
        .select("vote_type")
        .eq("report_id", report.id);
      if (error) return;
      setVotes({
        up: data?.filter((v) => v.vote_type === "upvote").length || 0,
        down: data?.filter((v) => v.vote_type === "downvote").length || 0,
      });
    };
    loadVotes();
  }, [report.id]);

  useEffect(() => {
    const loadUserVote = async () => {
      const { data } = await supabase
        .from("report_votes")
        .select("vote_type")
        .eq("report_id", report.id)
        .eq("anon_user_id", anonId)
        .maybeSingle();
      if (data?.vote_type) setVoted(data.vote_type);
    };
    loadUserVote();
  }, [report.id, anonId]);

  const handleVote = async (type: "upvote" | "downvote") => {
    if (voted === type) {
      await supabase.from("report_votes").delete()
        .eq("report_id", report.id).eq("anon_user_id", anonId);
      setVotes((v) => ({
        ...v,
        [type === "upvote" ? "up" : "down"]: type === "upvote" ? v.up - 1 : v.down - 1,
      }));
      setVoted(null);
      return;
    }
    await supabase.from("report_votes").upsert({
      report_id: report.id, anon_user_id: anonId, vote_type: type,
    });
    setVotes((v) => ({
      up: type === "upvote" ? v.up + 1 : voted === "upvote" ? v.up - 1 : v.up,
      down: type === "downvote" ? v.down + 1 : voted === "downvote" ? v.down - 1 : v.down,
    }));
    setVoted(type);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors">
      {report.image_url && (
        <img src={report.image_url} alt={report.title} className="w-full h-80 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
          {report.institutions?.name && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full shrink-0">
              {report.institutions.name}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{report.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {report.category && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {t(`category.${report.category}`, { defaultValue: report.category })}
            </span>
          )}
          {report.urgency && <UrgencyBadge urgency={report.urgency} />}
          {report.safety_related && (
            <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs rounded-full flex items-center gap-1">
              <Shield size={10} />
              {t("reports.safety")}
            </span>
          )}
        </div>

        {/* Admin response */}
        {report.admin_response && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-800 mb-0.5">{t("reports.official_response")}</p>
            <p className="text-xs text-blue-700 leading-relaxed">{report.admin_response}</p>
          </div>
        )}

        {report.status === "Rejected" && report.rejection_reason && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs font-semibold text-red-800 mb-0.5">{t("reports.rejection_reason")}</p>
            <p className="text-xs text-red-700 leading-relaxed">{report.rejection_reason}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3 min-w-0">
            {report.location_name && (
              <span className="flex items-center gap-1 truncate">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{report.location_name}</span>
              </span>
            )}
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={11} />
              {timeAgo(report.created_at, t)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleVote("upvote")}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                voted === "upvote" ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <ThumbsUp size={12} />
              {votes.up}
            </button>
            <button
              onClick={() => handleVote("downvote")}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                voted === "downvote" ? "bg-red-50 text-red-600" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <ThumbsDown size={12} />
              {votes.down}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
