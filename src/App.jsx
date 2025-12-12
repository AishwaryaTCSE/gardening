import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PlantProvider } from "./context/PlantContext";
import { TaskProvider } from "./context/TaskContext";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Alert from "./components/Alert";
import Home from "./pages/Home";
import Pests from "./pages/Pests";
import Soil from "./pages/Soil";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import PlantLibrary from "./pages/PlantLibrary";
import PlantDetail from "./pages/PlantDetail";
import AddEditPlant from "./pages/AddEditPlant";
import TaskList from "./pages/TaskList";
import AddEditTask from "./pages/AddEditTask";
import Journal from "./pages/Journal";
import Weather from "./pages/Weather";
import Community from "./pages/Community";
import GardenLayout from "./pages/GardenLayout";
import PestDisease from "./pages/PestDisease";
import NotFound from "./pages/NotFound";
import SmartCropFinder from "./pages/SmartCropFinder";

const appShellStyle = {
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  color: "#0f172a",
};

const contentStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px",
};

const loadingShellStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f8fafc",
  color: "#0f172a",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  if (isLoading) {
    return (
      <div style={loadingShellStyle}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "4px solid #22c55e",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
          <p style={{ marginTop: "12px" }}>Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <Router basename="/">
      <PlantProvider>
        <TaskProvider>
          <AppProvider>
            <div style={appShellStyle}>
              <Navbar
                isMobileMenuOpen={isMobileMenuOpen}
                toggleMobileMenu={toggleMobileMenu}
              />
              <main style={contentStyle}>
                <Routes>
                  {/* Smart farming spec routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/pests" element={<Pests />} />
                  <Route path="/soil" element={<Soil />} />

                  {/* Preserve legacy/extended routes */}
                  <Route path="/dashboard" element={<HomePage />} />
                  <Route path="/garden" element={<Dashboard />} />
                  <Route path="/plants" element={<PlantLibrary />} />
                  <Route path="/plants/:id" element={<PlantDetail />} />
                  <Route path="/plants/add" element={<AddEditPlant />} />
                  <Route path="/plants/edit/:id" element={<AddEditPlant />} />
                  <Route path="/tasks" element={<TaskList />} />
                  <Route path="/tasks/add" element={<AddEditTask />} />
                  <Route path="/tasks/edit/:id" element={<AddEditTask />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/weather" element={<Weather />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/garden-layout" element={<GardenLayout />} />
                  <Route path="/pest-disease" element={<PestDisease />} />
                  <Route path="/smart-crop" element={<SmartCropFinder />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <Alert />
            </div>
          </AppProvider>
        </TaskProvider>
      </PlantProvider>
    </Router>
  );
}
