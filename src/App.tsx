import { useState } from "react";
import type { Institution } from "./types";
import InstitutionSelect from "./pages/InstitutionSelect";
import PlatformPage from "./pages/PlatformPage";

function App() {
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);

  if (!selectedInstitution) {
    return (
      <InstitutionSelect onSelectInstitution={setSelectedInstitution} />
    );
  }

  return (
    <PlatformPage
      institution={selectedInstitution}
      onBack={() => setSelectedInstitution(null)}
    />
  );
}

export default App;