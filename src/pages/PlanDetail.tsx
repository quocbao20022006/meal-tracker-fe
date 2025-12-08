import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "../components/Header";
import MealCard from "../components/MealCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateMealPlanItemRequest,
  MEAL_TYPES,
  MealPlan,
  MealPlanItemResponse,
  MealPlanResponse,
  MealResponse,
  MealType,
} from "../types";
import * as mealService from "../services/meal.service";
import * as mealPlanService from "../services/meal-plan.service";
import * as mealPlanItemService from "../services/meal-plan-item.service";
import { useDebounce } from "@/hooks/useDebounce";

export default function PlanDetail() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();

  const [plan, setPlan] = useState<MealPlanResponse | null>(null);
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItemResponse[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    MealType.BREAKFAST
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMeal, setSelectedMeal] = useState<MealResponse | null>(null);
  // const [servings, setServings] = useState(1);
  const [availableMeals, setAvailableMeals] = useState<MealResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateIndex, setDateIndex] = useState<number>(0);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const loadMeals = async (mealName: string) => {
    const res = await mealService.searchMeals(mealName);
    if (res.data) {
      setAvailableMeals(res.data.content);
    } else {
      setAvailableMeals([]);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      loadMeals(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Helper function to get week dates
  const getWeekDates = (startDate: Date, endDate: Date) => {
    const dateArray = [];
    let current = startDate;
    while (current <= endDate) {
      dateArray.push(new Date(current)); // push clone của ngày hiện tại
      current.setDate(current.getDate() + 1); // tăng thêm 1 ngày
    }
    return dateArray;
  };

  const [weekDates, setWeekDates] = useState(
    getWeekDates(new Date(), new Date())
  );

  useEffect(() => {
    loadPlanDetails();
    loadAvailableMeals();
  }, [planId]);

  useEffect(() => {
    loadDateRange();
  }, [plan?.id]);

  const loadDateRange = () => {
    if (plan) {
      const dateRange = getWeekDates(
        new Date(plan.startDate),
        new Date(plan.endDate)
      );
      setWeekDates(dateRange);
      setSelectedDate(plan.startDate);
    }
  };

  const loadPlanDetails = async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const result = await mealPlanService.getMealPlanById(+planId);

      if (result.error) {
        alert(result.error.message || "Failed to fetch meals");
        return;
      }

      setPlan(result.data);

      const getMealPlanItemsResult =
        await mealPlanItemService.getMealPlanItemsByDate({
          mealPlanId: +planId,
          date: selectedDate,
        });
      setMealPlanItems(getMealPlanItemsResult?.data?.content || []);
    } catch (err) {
      console.error("Error loading plan details:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMeals = async () => {
    try {
      const result = await mealService.getAllMeals(0);
      if (result.data?.content) {
        setAvailableMeals(result.data.content);
      }
    } catch (err) {
      console.error("Error loading meals:", err);
    }
  };

  const handleAddMeal = async () => {
    if (!selectedMeal || !planId) return;

    try {
      const request: CreateMealPlanItemRequest = {
        mealPlanId: +planId,
        mealId: selectedMeal.id,
        mealDate: selectedDate,
        mealType: selectedMealType,
      };

      const result = await mealPlanItemService.createMealPlanItem(request);
      if (result.data) {
        setSelectedMeal(null);
        setShowAddMealModal(false);
        setSearchQuery("");
      }
    } catch (err) {
      console.error("Error adding meal:", err);
    }
  };

  const handleDeleteMeal = async (mealId: number) => {
    try {
      await mealPlanService.deleteMealPlan(mealId);
      setMeals(meals.filter((m) => m.id !== mealId));
    } catch (err) {
      console.error("Error deleting meal:", err);
    }
  };

  const getPlanMealsForDate = (date: string, mealType: MealType) => {
    return mealPlanItems.filter(
      (m) => m.mealDate === date && m.mealType === mealType
    );
  };

  const getTotalCalories = () => {
    return mealPlanItems.reduce((sum, m) => sum + (m.meal?.calories || 0), 0);
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

          {/* Plan Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
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

          {/* Date Picker Slider */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  {/* Previous Week Button */}
                  {dateIndex > 0 && (
                    <button
                      onClick={() => {
                        setDateIndex(dateIndex - 1);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Previous week"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Week View - 7 Days */}
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {weekDates
                      .slice(dateIndex, dateIndex + 7)
                      .map((date, idx) => {
                        const dateStr = date.toISOString().split("T")[0];
                        const isSelected = dateStr === selectedDate;
                        const isToday =
                          dateStr === new Date().toISOString().split("T")[0];

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`p-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
                              isSelected
                                ? "bg-emerald-500 text-white shadow-lg"
                                : isToday
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-400"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span className="text-xs">
                              {
                                [
                                  "Sun",
                                  "Mon",
                                  "Tue",
                                  "Wed",
                                  "Thu",
                                  "Fri",
                                  "Sat",
                                ][date.getDay()]
                              }
                            </span>
                            <span className="text-lg font-bold">
                              {date.getDate()}/{date.getMonth()}
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  {/* Next Week Button */}
                  {dateIndex + 7 < weekDates.length && (
                    <button
                      onClick={() => {
                        setDateIndex(dateIndex + 1);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Next week"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Display selected date info */}
                <div className="text-center text-sm text-muted-foreground mt-2">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Type Grid */}
          <div className="space-y-6">
            {Object.keys(MEAL_TYPES).map((type) => {
              const typeMeals = getPlanMealsForDate(
                selectedDate,
                type as MealType
              );
              const typeCalories = typeMeals.reduce(
                (sum, m) => sum + (m.meal?.calories || 0),
                0
              );

              return (
                <div key={type}>
                  {/* Meal Type Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                        {type}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round(typeCalories)} cal
                      </p>
                    </div>
                    {/* <Button
                      onClick={() => {
                        setSelectedMealType(type);
                        setSelectedMeal(null);
                        setServings(1);
                        setSearchQuery("");
                        setShowAddMealModal(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Meal
                    </Button> */}
                  </div>

                  {/* Meals Grid */}
                  {typeMeals.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                      {typeMeals.map((meal) => (
                        <div key={meal.id} className="relative group">
                          <MealCard
                            meal={meal.meal!}
                            onViewMeal={(id) => navigate(`/meals/${id}`)}
                          />
                          {/* Delete Button on Hover */}
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            title="Remove meal"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="mb-6 border-dashed">
                      <CardContent className="pt-6 py-12 flex flex-col items-center justify-center">
                        <Plus className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-4">
                          No meals added for {type}
                        </p>
                        <Button
                          onClick={() => {
                            setSelectedMealType(type as MealType);
                            setSelectedMeal(null);
                            // setServings(1);
                            setSearchQuery("");
                            setShowAddMealModal(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add {type}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Meal Modal */}
      <Dialog open={showAddMealModal} onOpenChange={setShowAddMealModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Meal - {selectedMealType}</DialogTitle>
            <DialogDescription>
              Select a meal to add to your plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date & Meal Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meal Type
                </label>
                <Select
                  value={selectedMealType}
                  onValueChange={(value) =>
                    setSelectedMealType(value as MealType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(MEAL_TYPES).map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="capitalize"
                      >
                        {MEAL_TYPES[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Search Meals
              </label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meals..."
              />
            </div>

            {/* Meals Grid Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              {availableMeals.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal)}
                  className={`text-left rounded-lg overflow-hidden transition-all ${
                    selectedMeal?.id === meal.id
                      ? "ring-2 ring-emerald-500 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                    {/* Image */}
                    <div className="h-32 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <img
                        src={
                          meal.image_url ||
                          "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400"
                        }
                        alt={meal.meal_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 text-gray-900 dark:text-white">
                        {meal.meal_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {meal.calories} cal
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Servings
            {selectedMeal && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Servings: {servings}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )} */}
          </div>
          <DialogFooter>
            {/* Add Button */}
            <Button
              onClick={handleAddMeal}
              disabled={!selectedMeal}
              className="w-full"
            >
              Add to Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
