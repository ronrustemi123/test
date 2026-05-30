import { useLocation, useNavigate } from "react-router";
import { Home, Map, FileText } from "lucide-react";

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/map", label: "Map", icon: Map },
  { path: "/reports", label: "Reports", icon: FileText },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100">
      <div className="max-w-lg mx-auto flex items-center">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "text-gray-900" : "text-gray-400"}
              />
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  active ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
