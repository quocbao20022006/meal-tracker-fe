import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Salad,
  Plus,
  Clock,
  CookingPot,
  Zap,
  Utensils,
  ChefHat,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useMealPlans } from "../hooks/useMealPlans";
import { MealResponse } from "../types";
import { getMealById, getSimilarMeals } from "../services/meal.service";
import SimilarRecipes from "../components/SimilarRecipes";
import MealEditModal from "../components/MealEditModal";
import InfoTag from "@/components/InfoTag";

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createMealPlan } = useMealPlans();
  const [meal, setMeal] = useState<MealResponse | null>(null);
  const [similarMeals, setSimilarMeals] = useState<MealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [checkedList, setCheckedList] = useState<boolean[]>([]);
  const [editing, setEditing] = useState(false);

  // Get meal details data
  useEffect(() => {
    const fetchMeal = async () => {
      try {
        setLoading(true);
        const res = await getMealById(Number(id));
        setMeal(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id]);

  // Get similar meals data
  useEffect(() => {
    const fetchSimilarMeals = async () => {
      try {
        const res = await getSimilarMeals(Number(id));
        setSimilarMeals(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setSimilarMeals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilarMeals();
  }, [id]);

  // Load checklist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`meal-checklist-${id}`);
    if (saved) {
      setCheckedList(JSON.parse(saved));
    } else if (meal?.mealIngredients) {
      setCheckedList(new Array(meal.mealIngredients.length).fill(false));
    }
  }, [id, meal]);

  // Save checklist to localStorage when change
  useEffect(() => {
    if (checkedList.length > 0) {
      localStorage.setItem(`meal-checklist-${id}`, JSON.stringify(checkedList));
    }
  }, [checkedList, id]);

  const toggleCheck = (index: number) => {
    setCheckedList((prev) => {
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
      category: meal.categoryName[0] ?? "mainCourse",
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Meal not found</p>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <button
          onClick={() => navigate("/meals")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> <span>Back</span>
        </button>
      </div>

      {/* Body contains 2 columns */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meal main info - left side */}
          <div className="lg:col-span-2">
            {/* Meal header card */}
            <div className="p-6 mb-6 flex flex-col lg:flex-row items-stretch gap-6 border border-emerald-400 rounded-2xl bg-white dark:bg-gray-800">
              {/* Image */}
              <div className="w-full lg:w-2/5">
                <img
                  src={meal.imageUrl ?? ""}
                  alt=""
                  className="w-full h-[300px] lg:h-[280px] rounded-2xl object-cover"
                />
              </div>

              {/* Meal info */}
              <div className="w-full lg:w-3/5 flex flex-col justify-start">
                <h1 className="mb-4 text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {meal.name}
                </h1>
                <div className="flex flex-wrap items-center justify-start gap-2 mb-4">
                  {/* Category */}
                  {meal.categoryName?.map((cat) => (
                    <InfoTag key={cat} icon="" value={cat} />
                  ))}
                  {/* Calories */}
                  <InfoTag
                    icon={<Zap className="w-4" />}
                    value={meal.calories.toPrecision().toString() + " kcal"}
                  />
                  {/* Cooking time */}
                  <InfoTag
                    icon={<Clock className="w-4" />}
                    value={meal.cookingTime}
                  />
                  {/* Servings */}
                  <InfoTag
                    icon={<Utensils className="w-4" />}
                    value={meal.servings + " servings"}
                  />
                </div>

                <h3 className="font-bold mb-2">Description:</h3>
                <p className="text-sm lg:text-base dark:text-gray-300">{meal.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Meal ingredients */}
              <div className="lg:col-span-1 border border-emerald-400 p-5 rounded-2xl bg-white dark:bg-gray-800">
                <h2 className="mb-4 text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <ChefHat className="w-5 h-5 lg:w-6 lg:h-6" />
                  Ingredients
                </h2>
                <div className="flex flex-col gap-3 ml-1">
                  {meal.mealIngredients.map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 cursor-pointer text-sm lg:text-base text-gray-700 dark:text-gray-200"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 lg:w-5 lg:h-5 accent-emerald-500 cursor-pointer"
                        checked={checkedList[index]}
                        onChange={() => toggleCheck(index)}
                      />
                      <span
                        className={`transition ${
                          checkedList[index] ? "line-through opacity-60" : ""
                        }`}
                      >
                        {item.ingredientName} — {item.quantity} {item.unit || ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2 border border-emerald-400 p-5 rounded-2xl bg-white dark:bg-gray-800">
                <h2 className="mb-4 text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <CookingPot className="w-5 h-5 lg:w-6 lg:h-6" /> Instructions
                </h2>
                {meal?.mealInstructions?.length ? (
                  meal.mealInstructions.map((s) => (
                    <div key={s.step} className="flex gap-3 items-start mb-4">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs lg:text-sm flex-shrink-0">
                        {s.step}
                      </span>
                      <p className="text-sm lg:text-base text-gray-800 dark:text-gray-200">
                        {s.instruction}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No instructions available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Meal sub info - right sidebar */}
          <div className="lg:col-span-1">
            {/* Edit recipe modal */}
            <MealEditModal
              meal={meal}
              onClose={() => setEditing(false)}
              onUpdate={(updated) => setMeal(updated)}
              isOpen={editing}
            />
            {/* Edit recipe */}
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 lg:py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Edit recipe
            </button>

            {/* Add to Today */}
            <button
              onClick={addToTodaysPlan}
              disabled={adding}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 lg:py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              {adding ? "Adding..." : "Add to Today's Plan"}
            </button>

            {/* Nutrition */}
            <div className="p-5 lg:p-6 mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-400 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Salad className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
                <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Nutritions
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {meal.nutrition?.map((item, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-2 bg-emerald-100 dark:bg-emerald-900/30
                              text-emerald-700 dark:text-emerald-300 rounded-full text-xs lg:text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {/* Similar recipes */}
            <SimilarRecipes
              recipes={similarMeals}
              onSelect={(id) => navigate(`/meal/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
