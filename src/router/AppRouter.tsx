import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import Meals from '../pages/Meals';
import MealDetail from '../pages/MealDetail';
import Planner from '../pages/Planner';
import HistoryPage from '../pages/History';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Sidebar from '../components/Sidebar';

function AppRoutes() {
  const { user, authLoading, hasProfile } = useAuthContext();

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Not authenticated - show login/register
  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login />
          }
        />
        <Route
          path="/register"
          element={
            <Register />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated but no profile - show onboarding
  if (!hasProfile) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // Authenticated with profile - show full app
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/meals/:id" element={<MealDetail />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
