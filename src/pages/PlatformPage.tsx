import { useState } from "react";
import type { BottomTab, Institution } from "../types";
import AppHeader from "../components/AppHeader";
import BottomTabs from "../components/BottomTabs";
import HomePage from "./HomePage";
import MapPage from "./MapPage";
import ChatsPage from "./ChatsPage";

type PlatformPageProps = {
  institution: Institution;
  onBack: () => void;
};

function PlatformPage({ institution, onBack }: PlatformPageProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>("home");

  return (
    <main className="min-h-screen bg-[#081220] text-white max-w-[460px] mx-auto border-x border-white/10 relative">
      <AppHeader institution={institution} onBack={onBack} />

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