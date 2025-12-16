import { useEffect, useState } from "react";
import { Clock, Flame, Plus } from "lucide-react";
import Header from "../components/Header";
import { useMealPlans } from "../hooks/useMealPlans";
import { useUserProfile } from "../hooks/useUserProfile";
import BarChart from "../components/CaloriesBarChart";
import WeightLineChart from "@/components/WeightLineChart";
import DailyCaloriesDonutChart from "@/components/DailyCaloriesDonutChart";
import GoalCard from "@/components/GoalCard";
import WeekCalendar from "@/components/WeekCalendar";
import { Button } from "@/components/ui/button";
import { MealCategory, MealType } from "../types/index";

const MEAL_TYPES: { [key in MealType]: string } = {
  appetizer: "Appetizers",
  mainCourse: "Main Course",
  snack: "Snacks",
  dessert: "Desserts",
  salad: "Salads",
  soup: "Soups",
  beverage: "Beverage",
};

const MEAL_TIMES = ["breakfast", "lunch", "dinner", "snack"] as const;

interface TodayMealItem {
  id: number;
  meal: MealResponse;
  mealType: MealType;
  servings: number;
  mealTime: (typeof MEAL_TIMES)[number];
}

interface DashboardProps {
  planId: number;
}

export default function Dashboard() {
  const { mealPlans, loading: mealsLoading } = useMealPlans();
  const { profile, loading: profileLoading } = useUserProfile(1); // Use dummy userId for now
  // const [todayMeals, setTodayMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [todayMeals, setTodayMeals] = useState<TodayMealItem[]>([]);
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MealCategory>(MealCategory.APPETIZERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealTime, setSelectedMealTime] =
    useState<(typeof MEAL_TIMES)[number]>("breakfast");

  // Load meals for selected date
  const loadMealsForDate = async () => {
    try {
      const result = await getMealsByPlanAndDate(planId, selectedDate);
      setTodayMeals(result || []);
    } catch (err) {
      console.error("Failed to load meals:", err);
    }
  };

  useEffect(() => {
    loadMealsForDate();
  }, [selectedDate, planId]);

  // Group meals by mealTime
  const mealsByTime = MEAL_TIMES.reduce<Record<string, TodayMealItem[]>>(
    (acc, time) => {
      acc[time] = todayMeals.filter((m) => m.mealTime === time);
      return acc;
    },
    {}
  );

  // const loadDashboardData = async () => {
  //   const today = new Date().toISOString().split("T")[0];

  //   if (mealPlans && mealPlans.length > 0) {
  //     const filtered = mealPlans.filter((mp) => mp.date === today);
  //     setTodayMeals(filtered);
  //   }

  //   setLoading(mealsLoading || profileLoading);
  // };

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
              <DailyCaloriesDonutChart goal={2000} consumed={1500} size={220} />
            </div>

            {/* Goal Card */}
            <div className="w-full flex-1">
              <GoalCard
                targetWeight={58}
                planType="Moderate"
                description="Follow this plan to gradually reach your target weight."
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
              {/* Meals by time */}
              {MEAL_TIMES.map((time) => (
                <div key={time} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold capitalize">{time}</h2>
                    <Button
                      onClick={() => {
                        setSelectedMealTime(time);
                        setShowAddMealDialog(true);
                      }}
                    >
                      Add Meal
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mealsByTime[time]?.length > 0 ? (
                      mealsByTime[time].map((mealItem) => (
                        <MealCard
                          key={mealItem.id}
                          meal={mealItem.meal}
                          selected={false}
                          onSelect={() => {}}
                          onViewMeal={() =>
                            window.open(`/meal/${mealItem.meal.id}`, "_blank")
                          }
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No meals added yet.</p>
                    )}
                  </div>
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
