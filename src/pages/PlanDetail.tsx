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
import { MealPlan, MealResponse, MealPlanTemplate } from "../types";
import * as mealService from "../services/meal.service";
import * as mealPlanService from "../services/meal-plan.service";

export default function PlanDetail() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();

  const [plan, setPlan] = useState<MealPlanTemplate | null>(null);
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>("breakfast");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMeal, setSelectedMeal] = useState<MealResponse | null>(null);
  const [servings, setServings] = useState(1);
  const [availableMeals, setAvailableMeals] = useState<MealResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  // Helper function to get week dates
  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const week = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(curr);
      day.setDate(first + i);
      week.push(day);
    }

    return week;
  };

  const [weekDates, setWeekDates] = useState(
    getWeekDates(new Date(selectedDate))
  );

  useEffect(() => {
    loadPlanDetails();
    loadAvailableMeals();
    setWeekDates(getWeekDates(new Date(selectedDate)));
  }, [planId]);

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

      // Mock meals for the plan
      const mockMeals: MealPlan[] = [
        {
          id: 1,
          userId: 1,
          mealId: 1,
          date: new Date().toISOString().split("T")[0],
          mealType: "breakfast",
          servings: 1,
          completed: false,
          meal: {
            id: 1,
            meal_name: "Oatmeal with Berries",
            meal_description: "Healthy oatmeal breakfast",
            image_url: null,
            meal_ingredients: [],
            meal_instructions: [],
            cooking_time: "10 mins",
            calories: 350,
            servings: 1,
            nutrition: [],
            category_name: ["Breakfast"],
          },
        },
        {
          id: 2,
          userId: 1,
          mealId: 2,
          date: new Date().toISOString().split("T")[0],
          mealType: "lunch",
          servings: 1,
          completed: false,
          meal: {
            id: 2,
            meal_name: "Grilled Chicken Salad",
            meal_description: "Fresh grilled chicken with mixed greens",
            image_url: null,
            meal_ingredients: [],
            meal_instructions: [],
            cooking_time: "15 mins",
            calories: 450,
            servings: 1,
            nutrition: [],
            category_name: ["Lunch"],
          },
        },
      ];
      setMeals(mockMeals);
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
    if (!selectedMeal) return;

    try {
      const request = {
        mealId: selectedMeal.id,
        date: selectedDate,
        mealType: selectedMealType,
        servings,
      };

      const result = await mealPlanService.createMealPlan(request);
      if (result.data) {
        // Add to local state
        const newMeal: MealPlan = {
          id: Math.max(...meals.map((m) => m.id), 0) + 1,
          userId: 1,
          mealId: selectedMeal.id,
          date: selectedDate,
          mealType: selectedMealType,
          servings,
          completed: false,
          meal: selectedMeal,
        };
        setMeals([...meals, newMeal]);

        // Reset form
        setSelectedMeal(null);
        setServings(1);
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

  const getFilteredMeals = () => {
    if (!searchQuery) return availableMeals;
    return availableMeals.filter((m) =>
      m.meal_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getPlanMealsForDate = (date: string, mealType: string) => {
    return meals.filter((m) => m.date === date && m.mealType === mealType);
  };

  const getTotalCalories = () => {
    return meals.reduce(
      (sum, m) => sum + (m.meal?.calories || 0) * m.servings,
      0
    );
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
                  {plan.description && (
                    <p className="text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  )}
                  {plan.goal && (
                    <div className="text-sm text-primary font-medium mt-2">
                      🎯 Goal: {plan.goal}
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
                  <button
                    onClick={() => {
                      const newDate = new Date(weekDates[0]);
                      newDate.setDate(newDate.getDate() - 7);
                      setSelectedDate(newDate.toISOString().split("T")[0]);
                      setWeekDates(getWeekDates(newDate));
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Previous week"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Week View - 7 Days */}
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {weekDates.map((date, idx) => {
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
                              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                                date.getDay()
                              ]
                            }
                          </span>
                          <span className="text-lg font-bold">
                            {date.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Week Button */}
                  <button
                    onClick={() => {
                      const newDate = new Date(weekDates[6]);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate.toISOString().split("T")[0]);
                      setWeekDates(getWeekDates(newDate));
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Next week"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
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
            {mealTypes.map((type) => {
              const typeMeals = getPlanMealsForDate(selectedDate, type);
              const typeCalories = typeMeals.reduce(
                (sum, m) => sum + (m.meal?.calories || 0) * m.servings,
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
                    <Button
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
                    </Button>
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
                            setSelectedMealType(type);
                            setSelectedMeal(null);
                            setServings(1);
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
            <DialogTitle>
              Add Meal -{" "}
              {selectedMealType &&
                selectedMealType.charAt(0).toUpperCase() +
                  selectedMealType.slice(1)}
            </DialogTitle>
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
                  onValueChange={setSelectedMealType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="capitalize"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
              {getFilteredMeals().map((meal) => (
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

            {/* Servings */}
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
            )}

            {/* Add Button */}
            <Button
              onClick={handleAddMeal}
              disabled={!selectedMeal}
              className="w-full"
            >
              Add to Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
