import type { BottomTab } from "../types";

type BottomTabsProps = {
  activeTab: BottomTab;
  setActiveTab: (tab: BottomTab) => void;
};

function BottomTabs({ activeTab, setActiveTab }: BottomTabsProps) {
  const tabClass = (tab: BottomTab) =>
    `rounded-2xl py-3 text-sm font-bold transition ${
      activeTab === tab
        ? "bg-gradient-to-br from-sky-400/25 to-violet-600/25 text-white"
        : "text-slate-400 hover:text-white"
    }`;

  return (
    <nav className="fixed left-1/2 bottom-4 z-30 grid w-[min(430px,calc(100%-28px))] -translate-x-1/2 grid-cols-3 gap-2 rounded-[1.6rem] border border-white/15 bg-slate-950/90 p-2 backdrop-blur-xl">
      <button onClick={() => setActiveTab("home")} className={tabClass("home")}>
        ⌂
        <span className="block">Home</span>
      </button>

      <button onClick={() => setActiveTab("map")} className={tabClass("map")}>
        ⌖
        <span className="block">Map</span>
      </button>

      <button onClick={() => setActiveTab("chats")} className={tabClass("chats")}>
        ☰
        <span className="block">Chats</span>
      </button>
    </nav>
  );
}

export default BottomTabs;