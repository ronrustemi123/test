// routes.tsx
import { createBrowserRouter } from "react-router";
import App from "./App";
import InstitutionSelect from "./pages/InstitutionSelect";
import PlatformPage from "./pages/PlatformPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App acts as the master layout
    children: [
      {
        index: true, // This maps to the base "/" path
        element: <InstitutionSelect />,
      },
      {
        path: "platform", // This maps to "/platform"
        element: <PlatformPage />,
      },
    ],
  },
]);
