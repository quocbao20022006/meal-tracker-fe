import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Clock, Flame, ChefHat } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useMealPlans } from "../hooks/useMealPlans";
import { MealResponse } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../components/Header";
import * as httpClient from "../lib/http-client";

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createMealPlan } = useMealPlans();

  const [meal, setMeal] = useState<MealResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions" | "nutrition">("ingredients");

  useEffect(() => {
    const fetchMealDetail = async () => {
      try {
        const mealId = Number(id);
        const { data, error } = await httpClient.get<MealResponse>(`/api/meal/${mealId}`);
        
        if (error) {
          console.error("Meal not found:", error);
          return;
        }

        setMeal(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetail();
  }, [id]);

  // Checklist ingredients
  const [checkedList, setCheckedList] = useState<boolean[]>([]);
  // Load checklist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`meal-checklist-${id}`);
    if (saved) {
      setCheckedList(JSON.parse(saved));
    } else if (meal?.meal_ingredients) {
      setCheckedList(new Array(meal.meal_ingredients.length).fill(false));
    }
  }, [id, meal]);
  // Save checklist to localStorage when change
  useEffect(() => {
    if (checkedList.length > 0) {
      localStorage.setItem(`meal-checklist-${id}`, JSON.stringify(checkedList));
    }
  }, [checkedList, id]);

  const toggleCheck = (index: number) => {
    setCheckedList(prev => {
      const newList = [...prev];
      newList[index] = !newList[index];
      return newList;
    });
  };

  // Add to meal plan
  const addToTodaysPlan = async () => {
    if (!meal) return;
    setAdding(true);

    const today = new Date().toISOString().split("T")[0];

    await createMealPlan({
      mealId: meal.id,
      date: today,
      category: meal.category_name[0] ?? "mainCourse",
      servings: 1,
    });

    setAdding(false);
  };

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );

  if (!meal)
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Meal Detail" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Meal not found</p>
        </div>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={meal.meal_name} />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => navigate("/meals")}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Meals
          </button>

          {/* Meal Image & Basic Info */}
          <Card className="mb-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {/* Image */}
              <div className="md:col-span-1">
                <img
                  src={meal.image_url || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400"}
                  alt={meal.meal_name}
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </div>

              {/* Info */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {meal.meal_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    {meal.meal_description}
                  </p>

                  {/* Quick Info */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Cooking time</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{meal.cooking_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{meal.calories}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Servings</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{meal.servings}</p>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {meal.category_name.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 capitalize font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={addToTodaysPlan}
                  disabled={adding}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {adding ? "Adding..." : "Add to Today's Plan"}
                </button>
              </div>
            </div>
          </Card>

          {/* Tabs Content */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
              {[
                { key: "ingredients" as const, label: "Ingredients" },
                { key: "instructions" as const, label: "Instructions" },
                { key: "nutrition" as const, label: "Nutrition" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Ingredients Tab */}
            {activeTab === "ingredients" && (
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {meal.meal_ingredients.map((item, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-emerald-500 cursor-pointer"
                          checked={checkedList[index] || false}
                          onChange={() => toggleCheck(index)}
                        />
                        <span className={`flex-1 transition ${checkedList[index] ? "line-through opacity-60" : "text-gray-900 dark:text-white"}`}>
                          {item.ingredient_name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {item.quantity}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions Tab */}
            {activeTab === "instructions" && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meal.meal_instructions.map((s) => (
                      <div key={s.step} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                            {s.step}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 pt-1">{s.instruction}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nutrition Tab */}
            {activeTab === "nutrition" && (
              <Card>
                <CardHeader>
                  <CardTitle>Nutritional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {meal.nutrition.map((item, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg font-medium text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
