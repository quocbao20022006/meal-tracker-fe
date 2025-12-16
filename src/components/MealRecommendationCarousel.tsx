import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import MealRecommendationCard from './MealRecommendationCard';
import { MealRecommendation } from '../services/chatbot.service';

interface MealRecommendationCarouselProps {
  meals: MealRecommendation[];
}

export default function MealRecommendationCarousel({ meals }: MealRecommendationCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      if (direction === 'left') {
        scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative group">
      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin' }}
      >
        {meals.map((meal) => (
          <MealRecommendationCard key={meal.mealId} meal={meal} />
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
