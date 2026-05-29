import type { Institution } from "../types";

type MapPageProps = {
  institution: Institution;
};

function MapPage({ institution }: MapPageProps) {
  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      <h1 className="text-4xl font-black">Map</h1>

      <p className="mt-2 text-slate-400">
        View reports and important places around the institution.
      </p>

      <div className="mt-6 h-[420px] overflow-hidden rounded-[2rem] border border-white/15">
        <iframe
          title="Tetovo Map"
          src="https://www.google.com/maps?q=Tetovo%20North%20Macedonia&output=embed"
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/10 p-5">
        <h3 className="font-bold">Nearby active reports</h3>
        <p className="mt-1 text-sm text-slate-400">
          3 reports found near {institution.name}.
        </p>
      </div>
    </div>
  );
}

export default MapPage;