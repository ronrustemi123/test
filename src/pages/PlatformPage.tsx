import { useState } from "react";
import type { BottomTab, Institution } from "../types";
import AppHeader from "../components/AppHeader";
import BottomTabs from "../components/BottomTabs";
import HomePage from "./HomePage";
import MapPage from "./MapPage";
import ChatsPage from "./ChatsPage";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useEffect } from "react";


function PlatformPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BottomTab>("home");

  // Cast the location state to extract our passed institution data securely
  const state = location.state as { institution?: Institution } | null;
  const institution = state?.institution;

  // Safety Guard: If a user refreshes or types /platform directly without state, boot them home
  useEffect(() => {
    if (!institution) {
      navigate("/", { replace: true });
    }
  }, [institution, navigate]);

  if (!institution) {
    return null; // Prevents flashing broken content while redirect executes
  }

  return (
    <main className="min-h-screen bg-[#081220] text-white max-w-[460px] mx-auto border-x border-white/10 relative">
      <AppHeader />

      <section className="p-5 pb-28">
        {activeTab === "home" && <HomePage institution={institution} />}
        {activeTab === "map" && <MapPage institution={institution} />}
        {activeTab === "chats" && <ChatsPage />}
      </section>

      <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}

export default PlatformPage;
