import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import Meals from "./pages/Meals";
import MealDetail from "./pages/MealDetail";
import Planner from "./pages/Planner";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
// import SettingsPage from "./pages/Settings";
import Sidebar from "./components/Sidebar";

function AppContent() {
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");

  const handleNavigate = (p: string) => {
    setPage(p);
    if (p === "meals") {
      navigate("/meals");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activePage={page} onNavigate={handleNavigate} />

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meals" element={<Meals onViewMeal={(id) => navigate(`/meal/${id}`)} />} />
          <Route path="/meal/:mealId" element={<MealDetail />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
