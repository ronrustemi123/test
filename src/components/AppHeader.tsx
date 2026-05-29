import { useLocation, useNavigate } from "react-router";
import type { Institution } from "../types";

function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pull the institution safely out of the router navigation state
  const state = location.state as { institution?: Institution } | null;
  const institution = state?.institution;

  return (
    <header className="sticky top-0 z-20 h-[82px] flex items-center gap-4 px-5 bg-[#081220]/85 backdrop-blur-xl border-b border-white/10">
      <button
        onClick={() => navigate("/")} // Go straight back to the selection screen
        className="h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/15 text-2xl"
      >
        ←
      </button>

      <div>
        {/* Fallbacks protect the layout if state is momentarily undefined during a transition */}
        <h2 className="text-xl font-bold">{institution?.name || "Loading..."}</h2>
        <p className="text-sm text-slate-400">{institution?.fullName || ""}</p>
      </div>
    </header>
  );
}

export default AppHeader;
