import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/Header';
import MealCard from '../components/MealCard';
import Pagination from '../components/Pagination';
import { MealResponse } from '../types';
import { useNavigate } from 'react-router-dom';
import * as mealService from '../services/meal.service';

export default function Meals() {
  const [meals, setMeals] = useState<MealResponse[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<MealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const navigate = useNavigate();

  // Fetch meals from API with service layer
  const fetchMeals = async (category: string, page: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = category === 'all'
        ? await mealService.getAllMeals(page)
        : await mealService.getMealsByCategory(category, page);

      if (result.error) {
        setError(result.error.message || 'Failed to fetch meals');
        return;
      }

      const data = result.data;
      setMeals(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meals when category or page changes
  useEffect(() => {
    fetchMeals(selectedType, currentPage);
  }, [selectedType, currentPage]);

  // Search filter (local UI only, does not call API)
  // const searchFilteredMeals = meals.filter(
  //   (m) =>
  //     m.meal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     m.meal_description?.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Get meals
  // useEffect(() => {
  //   fetchMeals(currentPage);
  // }, [currentPage]);

  // Filter meals by category
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

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button
            onClick={() => fetchMeals(selectedType, currentPage)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
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
                onClick={() => {
                  setSelectedType(type.id);
                  setCurrentPage(0); // reset page on category change
                }}
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
            
            {/* Meal cards */}
            {filteredMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onViewMeal={(id) => navigate(`/meals/${id}`)} />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
