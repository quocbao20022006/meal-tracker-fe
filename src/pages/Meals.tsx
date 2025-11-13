import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame, Clock, Plus, Eye } from 'lucide-react';
import Header from '../components/Header';

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
}

interface MealsProps {
  onViewMeal: (mealId: string) => void;
}

export default function Meals({ onViewMeal }: MealsProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, []);

  useEffect(() => {
    filterMeals();
  }, [meals, searchQuery, selectedType]);

  const loadMeals = async () => {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('is_public', true)
      .order('name');

    if (data) setMeals(data);
    setLoading(false);
  };

  const filterMeals = () => {
    let filtered = meals;

    if (searchQuery) {
      filtered = filtered.filter(meal =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(meal => meal.meal_type === selectedType);
    }

    setFilteredMeals(filtered);
  };

  const mealTypes = [
    { id: 'all', label: 'All Meals' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snacks' },
  ];

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
        title="Meals"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {mealTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedType === type.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => onViewMeal(meal.id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={meal.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {meal.calories} cal
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 capitalize">
                      {meal.meal_type}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
                    {meal.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {meal.description || 'Delicious and nutritious meal'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meal.prep_time + meal.cook_time} min
                    </span>
                    <div className="flex gap-2">
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fats}g</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[380px] cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 group">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-all">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-emerald-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Add Custom Meal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
