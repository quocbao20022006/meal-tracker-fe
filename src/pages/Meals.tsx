import { useEffect, useState } from 'react';
import { Clock, Plus, Eye } from 'lucide-react';
import Header from '../components/Header';
import { MealResponse } from '../types';
import { useNavigate } from 'react-router-dom';

interface MealsProps {
  onViewMeal: (mealId: string) => void;
}

export default function Meals({ onViewMeal }: MealsProps) {
  const [meals, setMeals] = useState<MealResponse[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<MealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const navigate = useNavigate();

  // Fetch meals from API
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch('/api/meal/all'); // adjust backend URL if needed
        if (!res.ok) throw new Error('Failed to fetch meals');
        const data: MealResponse[] = await res.json();
        setMeals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Filter meals when meals, searchQuery or selectedType change
  useEffect(() => {
    let filtered = meals;

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.meal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.meal_description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((m) =>
        m.category_name.includes(selectedType)
      );
    }

    setFilteredMeals(filtered);
  }, [meals, searchQuery, selectedType]);

  const mealTypes = [
    { id: 'all', label: 'All Meals' },
    { id: 'appetizer', label: 'Appetizers' },
    { id: 'mainCourse', label: 'Main courses' },
    { id: 'snack', label: 'Snacks' },
    { id: 'dessert', label: 'Desserts' },
    { id: 'salad', label: 'Salads' },
    { id: 'soup', label: 'Soups' },
    { id: 'beverage', label: 'Beverage' },
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
          {/* Meal Type Filters */}
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

          {/* Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => onViewMeal(meal.id.toString())}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      meal.image_url ||
                      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                    alt={meal.meal_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {meal.calories} cal
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {meal.category_name.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 capitalize"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
                    {meal.meal_name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {meal.meal_description || 'Delicious and nutritious meal'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meal.cooking_time}
                    </span>
                    <div className="flex gap-2">
                      <span>Nutrition: {meal.nutrition.join(', ')}</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {/* Add Meal Card */}
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[380px] cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 group"
              onClick={() => navigate('/add-meal')}
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-all">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-emerald-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Add Custom Meal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
