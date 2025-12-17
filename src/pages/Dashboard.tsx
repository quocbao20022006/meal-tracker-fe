import { useEffect, useState } from "react";
import { Clock, Flame, TrendingUp, Plus } from "lucide-react";
import Header from "../components/Header";
import { useMealPlans } from "../hooks/useMealPlans";
import { useUserProfile } from "../hooks/useUserProfile";
import { MealPlan } from "../types";
import BarChart from "../components/CaloriesBarChart";
import WeightLineChart from "@/components/WeightLineChart";
import DailyCaloriesDonutChart from "@/components/DailyCaloriesDonutChart";
import GoalCard from "@/components/GoalCard";
import WeekCalendar from "@/components/WeekCalendar";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuthContext();
  const { mealPlans, loading: mealsLoading } = useMealPlans();
  const { profile, loading: profileLoading } = useUserProfile(user?.id || 0);
  const [todayMeals, setTodayMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");


  const consumedCalories = 0; // Đợi gán tổng calories các meal trong ngày

  useEffect(() => {
    loadDashboardData();
  }, [mealPlans]);

  const loadDashboardData = async () => {
    const today = new Date().toISOString().split("T")[0];

    if (mealPlans && mealPlans.length > 0) {
      const filtered = mealPlans.filter((mp) => mp.date === today);
      setTodayMeals(filtered);
    }

    setLoading(mealsLoading || profileLoading);
  };

  const getPlanType = (): "Moderate" | "High" | "Low" => {
    if (!profile?.goal) return "Moderate";

    switch (profile.goal.toLowerCase()) {
      case "lose_weight":
        return "Low";
      case "gain_weight":
        return "High";
      case "maintain":
      default:
        return "Moderate";
    }
  };

  const mealsByType = {
    breakfast: todayMeals.filter((mp) => mp.mealType === "breakfast"),
    lunch: todayMeals.filter((mp) => mp.mealType === "lunch"),
    dinner: todayMeals.filter((mp) => mp.mealType === "dinner"),
    snack: todayMeals.filter((mp) => mp.mealType === "snack"),
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
      <Header
        title="Dashboard"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mt-8 flex justify-between items-stretch gap-10">
            {/* Daily Calories Donut */}
            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md flex-1 flex items-center justify-center">
              <DailyCaloriesDonutChart
                goal={profile?.dailyCalories || 2000}
                consumed={consumedCalories}
                size={220}
              />
            </div>

            {/* Goal Card */}
            <div className="w-full flex-1">
              <GoalCard
                targetWeight={profile?.weightGoal || profile?.weight || 0}
                currentWeight={profile?.weight || 0}
                currentBMI={profile?.bmi || 0}
                dailyCalories={Math.round(profile?.dailyCalories || 0)}
                planType={getPlanType()}
                description={
                  profile?.goal
                    ? `Your personalized ${getPlanType().toLowerCase()} plan to ${profile.goal.replace('_', ' ')}`
                    : "Your personalized plan to reach the target weight"
                }
              />
            </div>
          </div>

          <div className="w-full">
            <WeekCalendar />
          </div>

          <div>
            <h2 className="mt-8 text-xl font-bold text-gray-800 dark:text-white mb-4">
              Your Meals Today
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                <div
                  key={type}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 capitalize">
                    {type}
                  </h3>

                  {mealsByType[type as keyof typeof mealsByType].length > 0 ? (
                    <div className="space-y-3">
                      {mealsByType[type as keyof typeof mealsByType].map(
                        (mp) => (
                          <div
                            key={mp.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                          >
                            {mp.meal?.imageUrl && (
                              <img
                                src={mp.meal.imageUrl ?? ""}
                                alt={mp.meal.name ?? ""}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 dark:text-white">
                                {mp.meal?.name}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  {Math.round(
                                    (mp.meal?.calories || 0) * mp.servings
                                  )}{" "}
                                  cal
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {mp.meal?.cookingTime || 0} min
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all group">
                      <Plus className="w-6 h-6 mx-auto text-gray-400 group-hover:text-emerald-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add meal
                      </p>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <BarChart />
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <WeightLineChart userId={1} />
          </div>
        </div>
      </div>
    </div>
  );
}