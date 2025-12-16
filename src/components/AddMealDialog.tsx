import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MealCard from "./MealCard";
import * as mealService from "../services/meal.service";
import * as mealPlanItemService from "../services/meal-plan-item.service";
import {
  MealResponse,
  MealType,
  CreateMealPlanItemRequest,
  MealPlanItemResponse,
} from "../types";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mealPlanId: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  selectedMealType: MealType;
  setSelectedMealType: (type: MealType) => void;

  onAddSuccess: (meal: MealPlanItemResponse) => void;
}

const mealCategories = [
  { id: "appetizer", label: "Appetizers" },
  { id: "mainCourse", label: "Main courses" },
  { id: "snack", label: "Snacks" },
  { id: "dessert", label: "Desserts" },
  { id: "salad", label: "Salads" },
  { id: "soup", label: "Soups" },
  { id: "beverage", label: "Beverages" },
];

export default function AddMealDialog({
  open,
  onOpenChange,
  mealPlanId,
  selectedDate,
  setSelectedDate,
  selectedMealType,
  setSelectedMealType,
  onAddSuccess,
}: AddMealDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    mealCategories[0].id
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [availableMeals, setAvailableMeals] = useState<MealResponse[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch meals when category or searchQuery changes
  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        let res;
        if (searchQuery.trim()) {
          // Search by name
          res = await mealService.searchMeals(searchQuery.trim());
        } else {
          // Fetch by category
          res = await mealService.getMealsByCategory(selectedCategory);
        }
        setAvailableMeals(res.data?.content || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch meals");
        setAvailableMeals([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchMeals, 300); // debounce
    return () => clearTimeout(timeout);
  }, [selectedCategory, searchQuery]);

  const handleAddMeal = async () => {
    if (!selectedMeal) return;

    try {
      const request: CreateMealPlanItemRequest = {
        mealPlanId,
        mealId: selectedMeal.id,
        mealType: selectedMealType,
        mealDate: selectedDate,
      };

      const res = await mealPlanItemService.createMealPlanItem(request);
      console.log("API Response:", res.data); // Kiểm tra response
      console.log("Meal data:", res.data?.meal); // Kiểm tra meal object

      if (res.data) {
        onAddSuccess(res.data);
        setSelectedMeal(null);
        setSearchQuery("");
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add meal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
          <DialogDescription>
            Select a meal to add to your plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & Meal Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Meal Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Meals
            </label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meals..."
            />
          </div>

          {/* Meals Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              Loading...
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : availableMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              {availableMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  selected={selectedMeal?.id === meal.id}
                  onSelect={() => setSelectedMeal(meal)}
                  onViewMeal={() => navigate(`/meals/${meal.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No meals found
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleAddMeal}
            disabled={!selectedMeal}
            className="w-full"
          >
            Add to Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
