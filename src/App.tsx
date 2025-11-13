import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Meals from './pages/Meals';
import MealDetail from './pages/MealDetail';
import Planner from './pages/Planner';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    setHasProfile(!!data);
  };

  const handleViewMeal = (mealId: string) => {
    setSelectedMealId(mealId);
    setCurrentPage('meal-detail');
  };

  const handleBackFromMeal = () => {
    setSelectedMealId(null);
    setCurrentPage('meals');
  };

  if (authLoading || (user && hasProfile === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onToggle={() => setShowRegister(false)} />
    ) : (
      <Login onToggle={() => setShowRegister(true)} />
    );
  }

  if (!hasProfile) {
    return <Onboarding />;
  }

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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
