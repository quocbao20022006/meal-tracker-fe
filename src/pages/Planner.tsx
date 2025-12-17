import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMealPlans } from '../hooks/useMealPlans';
import { MealPlan, MealPlanResponse, MealPlanItemResponse } from '../types';
import * as mealPlanService from '../services/meal-plan.service';

export default function Planner() {
  const { getWeekMealPlans } = useMealPlans();
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));
  const [viewMode, setViewMode] = useState<'week' | 'stats'>('week');
  const [filteredMeals, setFilteredMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekStats, setWeekStats] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<MealPlanResponse | null>(null);
  const [activePlanMeals, setActivePlanMeals] = useState<MealPlanItemResponse[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    loadWeekMeals();
    loadActivePlan();
  }, [currentWeek]);

  const loadActivePlan = async () => {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;

    if (!userId) {
      console.log('❌ No user ID from localStorage');
      return;
    }

    setLoadingPlan(true);
    try {
      console.log('🔄 Loading active plan for userId:', userId);
      const result = await mealPlanService.getActiveMealPlanWithMeals({ userId });
      console.log('📦 Active plan result:', result);
      
      if (result?.data) {
        console.log('✅ Active plan found:', result.data.plan);
        console.log('🍽️ Meals in plan:', result.data.meals);
        setActivePlan(result.data.plan);
        setActivePlanMeals(result.data.meals);
      } else {
        console.log('⚠️ No active plan found');
        setActivePlan(null);
        setActivePlanMeals([]);
      }
    } catch (err) {
      console.error('❌ Error loading active plan:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    calculateWeekStats();
  }, [filteredMeals]);

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
    setLoading(true);
    try {
      const startDate = currentWeek[0].toISOString().split('T')[0];
      const result = await getWeekMealPlans(startDate);
      if (result.data) {
        setFilteredMeals(result.data);
      }
    } catch (err) {
      console.error('Error loading week meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeekStats = () => {
    const stats = currentWeek.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayMeals = filteredMeals.filter(mp => mp.date === dateStr);
      const calories = dayMeals.reduce((sum, mp) => sum + ((mp.meal?.calories || 0) * mp.servings), 0);
      
      return {
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories,
      };
    });
    setWeekStats(stats);
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

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Meal Planner" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Active Plan Card */}
          {activePlan && (
            <Card className="mb-6 border-l-4 border-l-primary bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{activePlan.name}</CardTitle>
                    <CardDescription>
                      {new Date(activePlan.startDate).toLocaleDateString()} - {new Date(activePlan.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {activePlan.targetCalories && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {activePlan.targetCalories}
                      </div>
                      <div className="text-xs text-muted-foreground">cal/day</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              {activePlan.note && (
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground">{activePlan.note}</p>
                </CardContent>
              )}
              {activePlanMeals.length > 0 && (
                <CardContent className="pt-0">
                  <div className="text-sm font-semibold mb-3 text-muted-foreground">
                    Meals ({activePlanMeals.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activePlanMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <div className="text-xs font-medium text-primary mb-1">
                          {meal.mealType}
                        </div>
                        <div className="text-sm font-medium text-foreground truncate">
                          {meal.meal?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {meal.meal?.calories} cal
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(meal.mealDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {loadingPlan && (
            <Card className="mb-6">
              <CardContent className="pt-6 flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-sm text-muted-foreground">Loading active plan...</span>
              </CardContent>
            </Card>
          )}

          {/* View Mode Tabs */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={() => setViewMode('week')}
              variant={viewMode === 'week' ? 'default' : 'outline'}
            >
              Weekly View
            </Button>
            <Button
              onClick={() => setViewMode('stats')}
              variant={viewMode === 'stats' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Statistics
            </Button>
          </div>

          {/* Week View */}
          {viewMode === 'week' && (
            <>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={previousWeek}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <h2 className="text-lg font-semibold">
                      {currentWeek[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
                      {currentWeek[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>

                    <Button
                      onClick={nextWeek}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Week Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {currentWeek.map((date, idx) => {
                  const calories = getDayCalories(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <Card
                      key={idx}
                      className={isToday ? 'ring-2 ring-primary' : ''}
                    >
                      <CardHeader className="pb-3">
                        <div className="text-center">
                          <CardDescription>
                            {dayNames[idx]}
                          </CardDescription>
                          <CardTitle className={isToday ? 'text-primary' : ''}>
                            {date.getDate()}
                          </CardTitle>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-center gap-2 text-primary">
                            <Flame className="w-4 h-4" />
                            <span className="font-semibold">{Math.round(calories)} cal</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {mealTypes.map((type) => {
                            const meals = getMealsForDay(date, type);
                            return (
                              <div key={type} className="p-2 bg-muted rounded-lg">
                                <div className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                                  {type}
                                </div>
                                {meals.length > 0 ? (
                                  <div className="space-y-1">
                                    {meals.map((mp) => (
                                      <div
                                        key={mp.id}
                                        className="text-xs text-foreground truncate"
                                      >
                                        {mp.meal?.name}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    No meal
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* Statistics View */}
          {viewMode === 'stats' && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Calorie Intake</CardTitle>
                <CardDescription>
                  Track your daily calorie consumption
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-7 gap-4">
                  {weekStats.map((stat, idx) => {
                    const maxCal = Math.max(...weekStats.map(s => s.calories), 2500);
                    const heightPercent = (stat.calories / maxCal) * 100;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="relative h-48 w-full flex items-end justify-center">
                          <div
                            className="w-8 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all hover:from-primary/90 hover:to-primary/60"
                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                            title={`${stat.calories} cal`}
                          />
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground mt-2">
                          {stat.day}
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {Math.round(stat.calories)} cal
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground mb-1">Total Calories</div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(weekStats.reduce((sum, s) => sum + s.calories, 0))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground mb-1">Average Daily</div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(weekStats.reduce((sum, s) => sum + s.calories, 0) / 7)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground mb-1">Max Day</div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(Math.max(...weekStats.map(s => s.calories), 0))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground mb-1">Min Day</div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(Math.min(...weekStats.map(s => s.calories).filter(c => c > 0), 2500))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
