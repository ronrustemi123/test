import { Outlet, useLocation } from "react-router";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  const location = useLocation();
  const hideNav = location.pathname === "/create-report";

  return (
    <div className=" bg-gray-50 pb-10">
      <Outlet />
      {!hideNav && <BottomNav />}
    </div>
  );
}
