import { Outlet } from "react-router";

function App() {
  return (
    <div className="app-global-wrapper font-sans antialiased">
      {/* 
        This is where your global contexts would go later:
        <ThemeProvider> or <Toaster />
      */}
      
      {/* The Outlet renders whatever child route is active */}
      <Outlet /> 
    </div>
  );
}

export default App;
