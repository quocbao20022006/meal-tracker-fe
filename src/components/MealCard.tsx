import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Eye } from "lucide-react";
import { MealResponse } from "../types";

interface MealCardProps {
  meal: MealResponse;
  selected?: boolean;
  onSelect: () => void; // click chọn meal
  onViewMeal: () => void; // click xem chi tiết
}

export default function MealCard({
  meal,
  selected = false,
  onSelect,
  onViewMeal,
}: MealCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border ${
        selected ? "ring-2 ring-emerald-500" : "border-transparent"
      }`}
    >
      {/* IMAGE SECTION */}
      <div
        className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
        onClick={onSelect} // click chọn meal
      >
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600"></div>
        )}

        <img
          src={meal?.imageUrl || ""}
          alt={meal?.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* CALORIES BADGE */}
        <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-full px-2 py-1 shadow-lg border border-white/20">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {meal?.calories}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              kcal
            </span>
          </div>
        </div>
      </div>

      <div className="p-4" onClick={onSelect}>
        {/* Category badges */}
        <div className="flex items-center gap-2 mb-2">
          {meal?.categoryName?.map((cat) => (
            <span
              key={cat}
              className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 capitalize"
            >
              {cat}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {meal?.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 h-10 line-clamp-2">
          {meal?.description || "Delicious and nutritious meal"}
        </p>

        <div className="flex gap-2 items-center text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          <Clock className="w-4 h-4" />
          {meal?.cookingTime} min
        </div>

        <div className="flex gap-2 items-center text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          <span>Nutrition: {meal?.nutrition.join(", ")}</span>
        </div>

        {/* VIEW DETAIL BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // tránh click chọn meal
            onViewMeal(); // navigate
          }}
          className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          See recipe
        </button>
      </div>
    </div>
  );
}
