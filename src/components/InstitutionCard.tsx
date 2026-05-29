import type { Institution } from "../types";

type InstitutionCardProps = {
  institution: Institution;
  onClick: () => void;
};

function InstitutionCard({ institution, onClick }: InstitutionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-3xl border border-white/15 bg-white/10 p-6 transition hover:-translate-y-1 hover:border-sky-400/60 hover:bg-sky-400/15"
    >
      <span className="block text-2xl font-extrabold">{institution.name}</span>

      <small className="mt-2 block text-slate-400 group-hover:text-slate-200">
        {institution.fullName}
      </small>
    </button>
  );
}

export default InstitutionCard;