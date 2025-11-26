import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import Header from '../components/Header';
import { useMealPlans } from '../hooks/useMealPlans';
import { MealPlan } from '../types';

export default function Planner() {
  const { mealPlans, loading, getWeekMealPlans } = useMealPlans();
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));
  const [filteredMeals, setFilteredMeals] = useState<MealPlan[]>([]);

  useEffect(() => {
    loadWeekMeals();
  }, [currentWeek]);

  function getWeekDates(date: Date) {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const week = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(curr);
      day.setDate(first + i);
      week.push(day);
    }

    return week;
  }

  const loadWeekMeals = async () => {
    const startDate = currentWeek[0].toISOString().split('T')[0];
    const result = await getWeekMealPlans(startDate);
    if (result.data) {
      setFilteredMeals(result.data);
    }
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeek[0]);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(getWeekDates(newDate));
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek[0]);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(getWeekDates(newDate));
  };

  const getMealsForDay = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredMeals.filter(
      mp => mp.date === dateStr && mp.mealType === mealType
    );
  };

  const getDayCalories = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayMeals = filteredMeals.filter(mp => mp.date === dateStr);
    return dayMeals.reduce((sum, mp) => sum + ((mp.meal?.calories || 0) * mp.servings), 0);
  };

  const getDayMacros = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayMeals = filteredMeals.filter(mp => mp.date === dateStr);
    return dayMeals.reduce(
      (acc, mp) => ({
        protein: acc.protein + ((mp.meal?.protein || 0) * mp.servings),
        carbs: acc.carbs + ((mp.meal?.carbs || 0) * mp.servings),
        fats: acc.fats + ((mp.meal?.fats || 0) * mp.servings),
      }),
      { protein: 0, carbs: 0, fats: 0 }
    );
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Weekly Planner" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={previousWeek}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {currentWeek[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
                {currentWeek[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>

              <button
                onClick={nextWeek}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {currentWeek.map((date, idx) => {
              const calories = getDayCalories(date);
              const macros = getDayMacros(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm ${
                    isToday ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {dayNames[idx]}
                    </div>
                    <div className={`text-2xl font-bold ${
                      isToday
                        ? 'text-emerald-600'
                        : 'text-gray-800 dark:text-white'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Flame className="w-4 h-4" />
                      <span className="font-semibold">{calories} cal</span>
                    </div>
                    <div className="flex justify-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>P: {Math.round(macros.protein)}g</span>
                      <span>C: {Math.round(macros.carbs)}g</span>
                      <span>F: {Math.round(macros.fats)}g</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {mealTypes.map((type) => {
                      const meals = getMealsForDay(date, type);
                      return (
                        <div
                          key={type}
                          className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 capitalize">
                            {type}
                          </div>
                          {meals.length > 0 ? (
                            <div className="space-y-1">
                              {meals.map((mp) => (
                                <div
                                  key={mp.id}
                                  className="text-xs text-gray-700 dark:text-gray-300 truncate"
                                >
                                  {mp.meal?.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              No meal
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
