import { useEffect, useState } from "react";
import { ArrowLeft, Salad, Plus, Clock, User, BatteryCharging } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useMealPlans } from "../hooks/useMealPlans";
import { MealResponse } from "../types"; // make sure Meal matches the API fields

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createMealPlan } = useMealPlans();

  const [meal, setMeal] = useState<MealResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingredients" | "recipe" | "nutrition">("ingredients");

  useEffect(() => {
    const fetchMealDetail = async () => {
      try {
        const res = await fetch(`/api/meal/${id}`);
        if (!res.ok) throw new Error("Meal not found");

        const data: MealResponse = await res.json();
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Meal not found</p>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <button
          onClick={() => navigate("/meals")} // 👈 use router navigation instead of internal state
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> <span>Back</span>
        </button>
      </div>

      <div className="flex justify-start gap-10 max-w-8xl mx-auto p-6 bg-gray-50 dark:bg-gray-900">
        {/* Meal main info */}
        <div className="w-3/4">
          {/* Meal info */}
          <div className="p-5 mb-10 flex items-stretch gap-10 border-emerald-400 border rounded-2xl">
            <div className="w-1/3">
              <img src={meal.image_url ?? ""} alt="" className="w-full h-full rounded-2xl object-cover" />
            </div>
            <div className="w-2/3 flex flex-col justify-between">
              <h1 className="mb-5 text-3xl font-bold text-gray-900 dark:text-white">{meal.meal_name}</h1>
              <p className="mb-5 dark:text-white">{meal.meal_description}</p>
              <div className="flex gap-10 mb-5 text-gray-900 dark:text-white">
                <div className="flex gap-2 font-bold text-gray-900 dark:text-white">
                  <Clock className="w-5" />
                  <span className="">Cooking time: {meal.cooking_time}</span>
                </div>
                <div className="flex gap-2 font-bold text-gray-900 dark:text-white">
                  <User className="w-5" />
                  <span>Servings: {meal.servings}</span>
                </div>
                <div className="flex gap-2 font-bold text-gray-900 dark:text-white">
                  <BatteryCharging className="w-5" />
                  <span>Total calories: {meal.calories}</span>
                </div>
              </div>
              <div className="flex gap-3">
                {meal.category_name.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 capitalize"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        
          {/* Meal ingredients & instructions */}
          <div className="flex items-stretch gap-10">
            {/* Ingredients */}
            <div className="w-1/3 p-5 border-emerald-400 border rounded-2xl">
              <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">Ingredients</h2>
              <div className="flex flex-col gap-3">
                {meal.meal_ingredients.map((item, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      checked={checkedList[index]}
                      onChange={() => toggleCheck(index)}
                    />
                    <span className={`transition ${checkedList[index] ? "line-through opacity-60" : ""}`}>
                      {item.ingredient_name} — {item.quantity}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="w-2/3 p-5 border-emerald-400 border rounded-2xl">
              <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">Instructions</h2>
              {meal.meal_instructions.map((s) => (
                <div key={s.step} className="flex gap-3 items-start">
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">{s.step}</span>
                  <p className="mb-5 text-gray-800 dark:text-gray-200">{s.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meal sub info */}
        <div className="w-1/4">
          {/* Edit recipe */}
          <button
            onClick={addToTodaysPlan}
            disabled={adding}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Edit recipe
          </button>
          
          {/* Add to Today */}
          <button
            onClick={addToTodaysPlan}
            disabled={adding}
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {adding ? "Adding..." : "Add to Today's Plan"}
          </button>

          {/* Nutrition */}
          <div className="p-6 mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-400 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Salad className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nutritions
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {meal.nutrition.map((item, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30
                            text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Similar recipes */}
          
        </div>
      </div>
      
      
      
      
      
      
      
      
      {/* Cover Image */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">

            {/* Image */}
            <div className="relative h-80">
              <img
                src={meal.image_url ?? ""}
                alt={meal.meal_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5">
                <h1 className="text-3xl font-bold text-white">{meal.meal_name}</h1>
                <p className="text-white/90">{meal.meal_description}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="p-6">
              <div className="flex gap-6 border-b pb-4 mb-4">
                {["ingredients", "recipe", "nutrition"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`capitalize font-medium ${
                      activeTab === tab ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Ingredients Tab */}
              {activeTab === "ingredients" && (
                <div className="space-y-3">
                  {meal.meal_ingredients.map((i) => (
                    <div key={i.ingredient_name} className="flex justify-between bg-gray-100 p-3 rounded-xl">
                      <span>{i.ingredient_name}</span>
                      <span>{i.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recipe Tab */}
              {activeTab === "recipe" && (
                <div className="space-y-4">
                  {meal.meal_instructions.map((s) => (
                    <div key={s.step} className="flex gap-3 items-start">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">{s.step}</span>
                      <p className="text-gray-800 dark:text-gray-200">{s.instruction}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to Today */}
              <button
                onClick={addToTodaysPlan}
                disabled={adding}
                className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {adding ? "Adding..." : "Add to Today's Plan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
