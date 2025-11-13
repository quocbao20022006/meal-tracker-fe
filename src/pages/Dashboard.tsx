import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Flame, TrendingUp, Plus } from 'lucide-react';
import Header from '../components/Header';

interface Meal {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prep_time: number;
  cook_time: number;
}

interface MealPlan {
  id: string;
  meal_id: string;
  meal_type: string;
  servings: number;
  completed: boolean;
  meals: Meal;
}

interface UserProfile {
  daily_calorie_goal: number;
  bmi: number;
  bmi_category: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [todayMeals, setTodayMeals] = useState<MealPlan[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const [mealsResult, profileResult] = await Promise.all([
      supabase
        .from('meal_plans')
        .select('*, meals(*)')
        .eq('user_id', user.id)
        .eq('date', today),
      supabase
        .from('user_profiles')
        .select('daily_calorie_goal, bmi, bmi_category')
        .eq('id', user.id)
        .maybeSingle()
    ]);

    if (mealsResult.data) setTodayMeals(mealsResult.data);
    if (profileResult.data) setProfile(profileResult.data);
    setLoading(false);
  };

  const totalCalories = todayMeals.reduce((sum, mp) => {
    return sum + (mp.meals.calories * mp.servings);
  }, 0);

  const remainingCalories = profile ? profile.daily_calorie_goal - totalCalories : 0;

  const mealsByType = {
    breakfast: todayMeals.filter(mp => mp.meal_type === 'breakfast'),
    lunch: todayMeals.filter(mp => mp.meal_type === 'lunch'),
    dinner: todayMeals.filter(mp => mp.meal_type === 'dinner'),
    snack: todayMeals.filter(mp => mp.meal_type === 'snack')
  };

  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
      case 'Normal': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
      case 'Overweight': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30';
      case 'Obese': return 'text-red-600 bg-red-50 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Flame className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calories Today</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalCalories}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{remainingCalories}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">BMI Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {profile?.bmi.toFixed(1)}
                    </p>
                    {profile && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getBMICategoryColor(profile.bmi_category)}`}>
                        {profile.bmi_category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Your Meals Today</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <div key={type} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 capitalize">
                    {type}
                  </h3>

                  {mealsByType[type as keyof typeof mealsByType].length > 0 ? (
                    <div className="space-y-3">
                      {mealsByType[type as keyof typeof mealsByType].map((mp) => (
                        <div key={mp.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          {mp.meals.image_url && (
                            <img
                              src={mp.meals.image_url}
                              alt={mp.meals.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {mp.meals.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {Math.round(mp.meals.calories * mp.servings)} cal
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {mp.meals.prep_time + mp.meals.cook_time} min
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all group">
                      <Plus className="w-6 h-6 mx-auto text-gray-400 group-hover:text-emerald-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add meal</p>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
