import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
import { Calendar, TrendingUp } from 'lucide-react';
import Header from '../components/Header';

interface DailyStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealCount: number;
}

export default function History() {
  // const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   if (user) loadHistory();
  // }, [user, period]);

  useEffect(() => {
    loadHistory();
  }, [period]);

  const loadHistory = async () => {
    // if (!user) return;

    // const days = period === 'week' ? 7 : 30;
    // const startDate = new Date();
    // startDate.setDate(startDate.getDate() - days);
    // const startDateStr = startDate.toISOString().split('T')[0];

    // const { data } = await supabase
    //   .from('meal_plans')
    //   .select('date, servings, meals(calories, protein, carbs, fats)')
    //   .eq('user_id', user.id)
    //   .gte('date', startDateStr)
    //   .eq('completed', true);

    // if (data) {
    //   const dailyData: { [key: string]: DailyStats } = {};

    //   data.forEach((mp) => {
    //     if (!dailyData[mp.date]) {
      //     if (!dailyData[mp.date]) {
    //       dailyData[mp.date] = {
    //         date: mp.date,
    //         calories: 0,
    //         protein: 0,
    //         carbs: 0,
    //         fats: 0,
    //         mealCount: 0
    //       };
    //     }

    //     dailyData[mp.date].calories += mp.meals.calories * mp.servings;
    //     dailyData[mp.date].protein += mp.meals.protein * mp.servings;
    //     dailyData[mp.date].carbs += mp.meals.carbs * mp.servings;
    //     dailyData[mp.date].fats += mp.meals.fats * mp.servings;
    //     dailyData[mp.date].mealCount += 1;
    //   });

    //   const statsArray = Object.values(dailyData).sort((a, b) =>
    //     a.date.localeCompare(b.date)
    //   );

    //   setStats(statsArray);
    // }

    setLoading(false);
  };

  const avgCalories = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.calories, 0) / stats.length)
    : 0;

  const avgProtein = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.protein, 0) / stats.length)
    : 0;

  const avgCarbs = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.carbs, 0) / stats.length)
    : 0;

  const avgFats = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.fats, 0) / stats.length)
    : 0;

  const maxCalories = stats.length > 0
    ? Math.max(...stats.map(s => s.calories))
    : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="History & Analytics" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex gap-3">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                period === 'week'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                period === 'month'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Calories</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{avgCalories}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Protein</span>
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{avgProtein}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Carbs</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{avgCarbs}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Fats</span>
                <TrendingUp className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{avgFats}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              Daily Calorie Intake
            </h3>

            {stats.length > 0 ? (
              <div className="space-y-4">
                {stats.map((stat) => {
                  const percentage = maxCalories > 0 ? (stat.calories / maxCalories) * 100 : 0;
                  const date = new Date(stat.date);

                  return (
                    <div key={stat.date}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {Math.round(stat.calories)} cal
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No meal data available for this period
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              Macronutrient Distribution
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protein
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {avgProtein}g
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{
                      width: `${avgProtein + avgCarbs + avgFats > 0 ? (avgProtein / (avgProtein + avgCarbs + avgFats)) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Carbs
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {avgCarbs}g
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${avgProtein + avgCarbs + avgFats > 0 ? (avgCarbs / (avgProtein + avgCarbs + avgFats)) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fats
                  </span>
                  <span className="text-sm font-bold text-yellow-600">
                    {avgFats}g
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full rounded-full"
                    style={{
                      width: `${avgProtein + avgCarbs + avgFats > 0 ? (avgFats / (avgProtein + avgCarbs + avgFats)) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
