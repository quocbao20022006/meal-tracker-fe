import { MealResponse } from "../types";
import { ChevronRight } from "lucide-react";

interface SimilarRecipesProps {
  recipes: MealResponse[];
  onSelect?: (id: string) => void;
}

export default function SimilarRecipes({ recipes, onSelect }: SimilarRecipesProps) {
  return (
    <div className="p-6 mt-10 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-400 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Similar Recipes
      </h2>

      <div className="space-y-4">
        {recipes.map((meal) => (
          // Single Meal Card
          <div
            key={meal.id}
            onClick={() => onSelect?.(meal.id.toString())}
            className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer p-4 border border-transparent hover:border-emerald-400"
          >
            {/* Image  */}
            <img
              src={meal.imageUrl ? meal.imageUrl : "https://via.placeholder.com/400x300?text=No+Image"}
              alt={meal.name}
              className="w-full max-h-40 mb-2 object-cover rounded-xl hover:scale-105 transition-transform"
            />

            {/* Info */}
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {meal.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {meal.description}
              </p>
            </div>
          </div>
        ))}

        {recipes.length === 0 && (
          <p className="text-gray-500 dark:text-gray-600 text-center py-6">
            No similar recipes found 👩‍🍳
          </p>
        )}
      </div>
    </div>
  );
}
