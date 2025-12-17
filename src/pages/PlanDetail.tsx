import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, Flame, CheckCircle, Circle } from "lucide-react";
import Header from "../components/Header";
import MealCard from "../components/MealCard";
import AddMealDialog from "../components/AddMealDialog";
import WeekDateSlider from "../components/WeekDateSlider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreateMealPlanItemRequest,
  MEAL_TYPES,
  MealPlanItemResponse,
  MealPlanResponse,
  MealResponse,
  MealType,
} from "../types";
import * as mealPlanService from "../services/meal-plan.service";
import * as mealPlanItemService from "../services/meal-plan-item.service";
import * as mealService from "../services/meal.service";

export default function PlanDetail() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();

  const [plan, setPlan] = useState<MealPlanResponse | null>(null);
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItemResponse[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    MealType.BREAKFAST
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMeal, setSelectedMeal] = useState<MealResponse | null>(null);

  const [mealsByType, setMealsByType] = useState<
    Record<string, MealPlanItemResponse[]>
  >({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const [weekDates, setWeekDates] = useState<Date[]>([new Date()]);
  const [dateIndex, setDateIndex] = useState<number>(0);

  // Load plan details
  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    mealPlanService
      .getMealPlanById(+planId)
      .then((res) => {
        if (res.data) {
          setPlan(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [planId]);

  // Load meal plan items for selectedDate
  // const loadMealPlanItems = async (date: string) => {
  //   if (!planId) return;
  //   setLoading(true);
  //   try {
  //     const res = await mealPlanItemService.getMealPlanItemsByDate({
  //       mealPlanId: +planId,
  //       date,
  //     });
  //     const items = res.data?.content || [];
  //     setMealPlanItems(items);

  //     // Group by mealType
  //     const grouped: Record<string, MealPlanItemResponse[]> = {
  //       breakfast: [],
  //       lunch: [],
  //       dinner: [],
  //       snack: [],
  //     };
  //     items.forEach((item) => {
  //       if (grouped[item.mealType]) {
  //         grouped[item.mealType].push(item);
  //       }
  //     });
  //     setMealsByType(grouped);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // Load meal plan items for selectedDate
  const loadMealPlanItems = async (date: string) => {
    console.log(date);
    if (!planId) return;
    setLoading(true);
    try {
      const res = await mealPlanItemService.getMealPlanItemsByDate({
        mealPlanId: +planId,
        date,
      });
      const items = res.data?.content || [];
      console.log("dấdasdasds",res.data);

      // Fetch thông tin meal cho từng item
      const itemsWithMeals = await Promise.all(
        items.map(async (item) => {
          try {
            const mealRes = await mealService.getMealById(item.mealId);
            return {
              ...item,
              meal: mealRes.data,
            };
          } catch (err) {
            console.error(`Failed to fetch meal ${item.mealId}:`, err);
            return item; // Giữ item gốc nếu fetch lỗi
          }
        })
      );

      setMealPlanItems(itemsWithMeals);

      // Group by mealType
      const grouped: Record<string, MealPlanItemResponse[]> = {
        BREAKFAST: [],
        LUNCH: [],
        DINNER: [],
        SNACK: [],
      };

      itemsWithMeals.forEach((item) => {
        if (grouped[item.mealType]) {
          grouped[item.mealType].push(item);
        }
      });

      console.log("grop", grouped)
      setMealsByType(grouped);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // When selectedDate changes
  useEffect(() => {
    loadMealPlanItems(selectedDate);
  }, [selectedDate]);

  // Week date slider
  useEffect(() => {
    if (!plan) return;
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const dates: Date[] = [];
    let current = start;
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    setWeekDates(dates);

    const todayStr = formatDate(new Date());
    const todayIndex = dates.findIndex((d) => formatDate(d) === todayStr);
    setDateIndex(todayIndex !== -1 ? todayIndex : 0);
    setSelectedDate(todayStr);
  }, [plan]);

  // Add meal
  // const handleAddSuccess = (item: MealPlanItemResponse) => {

  //   setMealsByType((prev) => {
  //     const current = prev[item.mealType] || [];
  //     return { ...prev, [item.mealType]: [...current, item] };
  //   });
  // };
  const handleAddSuccess = async (item: MealPlanItemResponse) => {
    try {
      // Fetch meal details bằng mealId
      const mealRes = await mealService.getMealById(item.mealId);

      if (mealRes.data) {
        // Tạo meal plan item có đầy đủ thông tin meal
        const fullItem: MealPlanItemResponse = {
          ...item,
          meal: mealRes.data,
        };

        // Thêm vào state
        setMealsByType((prev) => {
          const current = prev[item.mealType] || [];
          return { ...prev, [item.mealType]: [...current, fullItem] };
        });
      }
    } catch (err) {
      console.error("Failed to fetch meal details:", err);
      // Nếu fetch lỗi, reload toàn bộ data
      await loadMealPlanItems(selectedDate);
    }
  };

  const handleDeleteMeal = async (id: number, type: string) => {
    try {
      await mealPlanItemService.deleteMealPlanItem(id);
      setMealsByType((prev) => ({
        ...prev,
        [type]: prev[type].filter((m) => m.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete meal:", err);
    }
  };

  const getTotalCalories = () => {
    return mealPlanItems.reduce((sum, m) => sum + (m.meal?.calories || 0), 0);
  };

  const handleToggleActive = async () => {
    if (!plan || toggling) return;
    
    try {
      setToggling(true);
      await mealPlanService.toggleMealPlanActive(plan.id, plan);
      setPlan((prevPlan) => {
        if (!prevPlan) return null;
        return {
          ...prevPlan,
          isActive: !prevPlan.isActive,
        };
      });
    } catch (err) {
      console.error("Failed to toggle plan active status:", err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Plan Details" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Plan not found</p>
            <Button onClick={() => navigate("/plans")}>Back to Plans</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={plan.name} />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate("/plans")}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>

          {/* Plan Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.note && (
                    <p className="text-muted-foreground mt-2">{plan.note}</p>
                  )}
                  {plan.targetCalories && (
                    <div className="text-sm text-primary font-medium mt-2">
                      🎯 Goal: {plan.targetCalories}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleToggleActive}
                  disabled={toggling}
                  variant={plan.isActive ? "default" : "outline"}
                  className={`flex items-center gap-2 whitespace-nowrap ml-4 ${
                    plan.isActive
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-gray-300"
                  }`}
                >
                  {toggling ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                  ) : plan.isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  {plan.isActive ? "Active" : "Inactive"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Start Date
                    </div>
                    <div className="font-semibold">
                      {new Date(plan.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      End Date
                    </div>
                    <div className="font-semibold">
                      {new Date(plan.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Calories
                    </div>
                    <div className="font-semibold">
                      {Math.round(getTotalCalories())} cal
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Week Slider */}
          <WeekDateSlider
            weekDates={weekDates}
            selectedDate={selectedDate}
            dateIndex={dateIndex}
            onSelectDate={setSelectedDate}
            onPrev={() => setDateIndex(dateIndex - 1)}
            onNext={() => setDateIndex(dateIndex + 1)}
          />

          {/* Meals By Type */}
          <div className="space-y-6">
            {Object.keys(MEAL_TYPES).map((type) => {
              const typeMeals = mealsByType[type] || [];
              const typeCalories = typeMeals.reduce(
                (sum, m) => sum + (m.meal?.calories || 0),
                0
              );

              return (
                <div key={type}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                        {MEAL_TYPES[type]}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round(typeCalories)} cal
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedMealType(type as MealType);
                        setSelectedMeal(null);
                        setShowAddMealModal(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Meal
                    </Button>
                  </div>

                  {/* Meals Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6 min-h-[150px]">
                    {typeMeals.length > 0 ? (
                      typeMeals.map((mealItem) => (
                        <div key={mealItem.id} className="relative group">
                          <MealCard
                            key={mealItem.id}
                            meal={mealItem.meal}
                            onViewMeal={(id) => navigate(`/meals/${id}`)}
                          />
                          <button
                            onClick={() => handleDeleteMeal(mealItem.id, type)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            title="Remove meal"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <Card className="border-dashed col-span-full flex items-center justify-center">
                        <CardContent className="pt-6 py-12 flex flex-col items-center justify-center">
                          <p className="text-muted-foreground mb-4">
                            No meals added for {MEAL_TYPES[type]}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Meal Modal */}
      <AddMealDialog
        open={showAddMealModal}
        onOpenChange={setShowAddMealModal}
        mealPlanId={+planId}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedMealType={selectedMealType}
        setSelectedMealType={setSelectedMealType}
        onAddSuccess={handleAddSuccess}
      />
    </div>
  );
}
