import { createBrowserRouter } from "react-router";
import App from "./App";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import ReportsPage from "./pages/ReportsPage";
import { CreateReportWizard } from "./components/CreateReportWizard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "map", element: <MapPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "create-report", element: <CreateReportWizard /> },
    ],
  },
]);
