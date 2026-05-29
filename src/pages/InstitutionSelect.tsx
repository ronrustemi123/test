import type { Institution } from "../types";
import { institutions } from "../data/institutions";
import InstitutionCard from "../components/InstitutionCard";

type InstitutionSelectProps = {
  onSelectInstitution: (institution: Institution) => void;
};

function InstitutionSelect({ onSelectInstitution }: InstitutionSelectProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-5 bg-[#07111f] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.35),transparent_35%)]" />

      <section className="relative w-full max-w-5xl rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl p-7 md:p-12">
        <div className="w-fit rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm text-sky-200 mb-5">
          Smart Institution Platform
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight">
          Choose your institution
        </h1>

        <p className="mt-5 max-w-2xl text-slate-300 text-base md:text-lg leading-8">
          Select an institution first. After that, you will enter a mobile-style
          app platform with Home, Map, and Chats.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-9">
          {institutions.map((institution) => (
            <InstitutionCard
              key={institution.id}
              institution={institution}
              onClick={() => onSelectInstitution(institution)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default InstitutionSelect;