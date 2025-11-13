import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, Users, Flame, Plus } from 'lucide-react';

interface Ingredient {
  name: string;
  quantity: string;
}

interface RecipeStep {
  step: number;
  instruction: string;
}

interface Meal {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: Ingredient[];
  recipe_steps: RecipeStep[];
}

interface MealDetailProps {
  mealId: string;
  onBack: () => void;
}

export default function MealDetail({ mealId, onBack }: MealDetailProps) {
  const { user } = useAuth();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipe' | 'nutrition'>('ingredients');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadMeal();
  }, [mealId]);

  const loadMeal = async () => {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('id', mealId)
      .maybeSingle();

    if (data) setMeal(data);
    setLoading(false);
  };

  const addToTodaysPlan = async () => {
    if (!user || !meal) return;

    setAdding(true);
    const today = new Date().toISOString().split('T')[0];

    await supabase.from('meal_plans').insert({
      user_id: user.id,
      meal_id: meal.id,
      date: today,
      meal_type: meal.meal_type,
      servings: 1,
      completed: false
    });

    setAdding(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Meal not found</p>
      </div>
    );
  }

  const totalMacros = meal.protein + meal.carbs + meal.fats;
  const proteinPercent = (meal.protein / totalMacros) * 100;
  const carbsPercent = (meal.carbs / totalMacros) * 100;
  const fatsPercent = (meal.fats / totalMacros) * 100;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Meals</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-80">
              <img
                src={meal.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl font-bold text-white mb-2">{meal.name}</h1>
                <p className="text-white/90">{meal.description}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Flame className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{meal.calories}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Clock className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{meal.prep_time}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Prep (min)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Clock className="w-6 h-6 mx-auto text-teal-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{meal.cook_time}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cook (min)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Users className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{meal.servings}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Servings</p>
                </div>
              </div>

              <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                {['ingredients', 'recipe', 'nutrition'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`px-6 py-3 font-medium capitalize transition-all ${
                      activeTab === tab
                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-emerald-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'ingredients' && (
                <div className="space-y-3">
                  {meal.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <span className="text-gray-800 dark:text-white font-medium">
                        {ingredient.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {ingredient.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'recipe' && (
                <div className="space-y-4">
                  {meal.recipe_steps.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {step.step}
                      </div>
                      <p className="flex-1 text-gray-700 dark:text-gray-300 pt-1">
                        {step.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <div className="text-4xl font-bold text-red-600 mb-2">
                        {proteinPercent.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Protein</div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {meal.protein}g
                      </div>
                    </div>
                    <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {carbsPercent.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carbs</div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {meal.carbs}g
                      </div>
                    </div>
                    <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                      <div className="text-4xl font-bold text-yellow-600 mb-2">
                        {fatsPercent.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fats</div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {meal.fats}g
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                      Nutrition per Serving
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Energy</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {meal.calories} kcal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Fat</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {meal.fats}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Carbohydrates</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {meal.carbs}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Protein</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {meal.protein}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={addToTodaysPlan}
                disabled={adding}
                className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {adding ? 'Adding...' : 'Add to Today\'s Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
