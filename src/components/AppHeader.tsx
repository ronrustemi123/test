import type { Institution } from "../types";

type AppHeaderProps = {
  institution: Institution;
  onBack: () => void;
};

function AppHeader({ institution, onBack }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-[82px] flex items-center gap-4 px-5 bg-[#081220]/85 backdrop-blur-xl border-b border-white/10">
      <button
        onClick={onBack}
        className="h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/15 text-2xl"
      >
        ←
      </button>

      <div>
        <h2 className="text-xl font-bold">{institution.name}</h2>
        <p className="text-sm text-slate-400">{institution.fullName}</p>
      </div>
    </header>
  );
}

export default AppHeader;