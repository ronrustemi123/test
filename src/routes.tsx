import { createBrowserRouter } from "react-router";
import App from "./App";
import InstitutionSelect from "./pages/InstitutionSelect";
import PlatformPage from "./pages/PlatformPage";
import CreateReportPage from "./pages/CreateReportPage"; // Our new page

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <InstitutionSelect /> },
      { path: "platform", element: <PlatformPage /> },
      { path: "create-report", element: <CreateReportPage /> }, // Add this
    ],
  },
]);
