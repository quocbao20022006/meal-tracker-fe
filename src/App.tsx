import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
// import { supabase } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import Meals from './pages/Meals';
import MealDetail from './pages/MealDetail';
import Planner from './pages/Planner';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Onboarding from './pages/Onboarding';
// import { useAuth } from './contexts/AuthContext';
// import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  // const { user, authLoading, hasProfile } = useAuth();

  const handleViewMeal = (mealId: string) => {
    setSelectedMealId(mealId);
    setCurrentPage('meal-detail');
  };

  const handleBackFromMeal = () => {
    setSelectedMealId(null);
    setCurrentPage('meals');
  };

  // if (authLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (!user) {
  //   return <Login />;
  // }

  // if (!hasProfile) {
  //   return <Onboarding />;
  // }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />

      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'meals' && <Meals onViewMeal={handleViewMeal} />}
      {currentPage === 'meal-detail' && selectedMealId && (
        <MealDetail mealId={selectedMealId} onBack={handleBackFromMeal} />
      )}
      {currentPage === 'planner' && <Planner />}
      {currentPage === 'history' && <History />}
      {currentPage === 'profile' && <Profile />}
      {currentPage === 'settings' && <Settings />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      {/* <AuthProvider> */}
      {/* </AuthProvider> */}
    </ThemeProvider>
  );
}
