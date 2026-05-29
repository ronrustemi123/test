import type { Institution } from "../types";
import { reports } from "../data/reports";
import ReportCard from "../components/ReportCard";

type HomePageProps = {
  institution: Institution;
};

function HomePage({ institution }: HomePageProps) {
  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      <div className="rounded-[2rem] border border-white/15 bg-gradient-to-br from-sky-400/30 to-violet-600/25 p-7">
        <span className="text-sky-200 text-sm font-bold">
          {institution.city}
        </span>

        <h1 className="mt-3 text-4xl font-black tracking-tight leading-tight">
          Welcome to {institution.name}
        </h1>

        <p className="mt-4 text-slate-200 leading-7">
          {institution.description}
        </p>

        <button className="mt-6 w-full rounded-2xl bg-white text-slate-950 py-4 font-extrabold">
          Report a Problem
        </button>
      </div>

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h3 className="font-bold text-lg">Recent reports</h3>
        <button className="text-sky-300 font-bold">View all</button>
      </div>

      <div className="space-y-3">
        {reports.map((report, index) => (
          <ReportCard key={index} report={report} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;