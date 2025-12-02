import { useState, useEffect } from "react";
import { IngredientResponse, MealResponse, UpdateMealRequest } from "../types";
import { X, Plus, Trash } from "lucide-react";
import { getAllIngredients } from "../services/ingredient.service";
import { updateMeal } from "../services/meal.service";
import AutocompleteIngredientInput from "./AutocompleteIngredientInput";

interface EditMealModalProps {
  meal: MealResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: UpdateMealRequest) => void;
}

type InstructionKey = "step" | "instruction";

export default function EditMealModal({ meal, isOpen, onClose, onUpdate }: EditMealModalProps) {
    const [mealForm, setMealForm] = useState<MealResponse>(meal);
    const [form, setForm] = useState<UpdateMealRequest>({
      meal_name: meal.meal_name,
      image: null, // chưa có ảnh mới
      meal_ingredients: meal.meal_ingredients.map(ing => ({
        ingredient_id: ing.id,
        quantity: ing.quantity
      })),
      meal_instructions: Array.isArray(meal.meal_instructions)
        ? meal.meal_instructions.map(ins => ({
            step: ins.step,
            instruction: ins.instruction
          }))
        : [],
      cooking_time: meal.cooking_time || "",
      servings: meal.servings || 1
    });

    const [allIngredients, setAllIngredients] = useState<IngredientResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const handleIngredientChange = (
      index: number, 
      key: "ingredient_name" | "quantity", 
      value: string | number, 
      calories?: number
    ) => {
      setForm(prev => {
        const arr = [...prev.meal_ingredients];
        if (key === "ingredient_name" && typeof value === "string") {
          arr[index].ingredient_name = value;
          if (calories != undefined) arr[index].calories = calories;
        }
        if (key === "quantity") {
          arr[index].quantity = Number(value);
        }
        return { ...prev, meal_ingredients: arr };
      });
    };

    const handleInstructionChange = (index: number, key: InstructionKey, value: string) => {
      setForm(prev => {
        const arr = [...prev.meal_instructions];
        arr[index].instruction = value;
        return { ...prev, meal_instructions: arr };
      });
    };

    const addIngredient = () => {
      setForm(prev => ({
        ...prev,
        meal_ingredients: [...prev.meal_ingredients, { id: 0, ingredient_name: "", quantity: 0, calories: 0 }]
      }));
    };

    const removeIngredient = (index: number) => {
      setForm(prev => ({
        ...prev,
        meal_ingredients: prev.meal_ingredients.filter((_, i) => i !== index)
      }));
    };

    const addInstruction = () => {
      setForm(prev => ({
        ...prev,
        meal_instructions: [
          ...(Array.isArray(prev.meal_instructions) ? prev.meal_instructions : []),
          { id: 0, step: (Array.isArray(prev.meal_instructions) ? prev.meal_instructions.length : 0) + 1, instruction: "" }
        ]
      }));
    };

    const removeInstruction = (index: number) => {
      setForm(prev => ({
        ...prev,
        meal_instructions: prev.meal_instructions.filter((_, i) => i !== index)
      }));
    };

    const getHoursFromCookingTime = (time: string | null | undefined) => {
      if (!time) return "0";
      const match = time.match(/(\d+)\s*hour/);
      return match ? match[1] : "0";
    };

    const getMinutesFromCookingTime = (time: string | null | undefined) => {
      if (!time) return "0";
      const match = time.match(/(\d+)\s*minute/);
      return match ? match[1] : "0";
    };

    const handleCookingTime = (hours: string, minutes: string) => {
        let cookingTime = "";
        const h = Number(hours);
        const m = Number(minutes);

        if (h > 0) {
            cookingTime += `${h} hour${h > 1 ? "s" : ""} `;
        }
        if (m > 0) {
            cookingTime += `${m} minute${m > 1 ? "s" : ""}`;
        }
        cookingTime = cookingTime.trim();
        setForm(prev => ({...prev, cooking_time: cookingTime}));
    };

    const handleSave = async () => {
      try {
        setLoading(true);
        // 1. cập nhật UI trước
        onUpdate(form);

        // 2. gọi API lưu xuống backend
        await updateMeal(meal.id, form);

        alert("Meal updated!");
        onClose();
      } catch (err) {
        console.error(err);
        alert("Update failed");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
    const fetchIngredients = async () => {
        try {
        const res = await getAllIngredients();
        console.log("ingredients response.data:", res.data);
        const data = res.data;
        setAllIngredients(Array.isArray(data?.content) ? data.content : []);
        } catch (err) {
        console.error(err);
        }
    };
    fetchIngredients();
    }, []);

    useEffect(() => {
      if (isOpen) {
        setLoading(false);  // mở modal thì đảm bảo không bị block bởi loading
        setMealForm({ ...meal }); // reset lại form từ meal gốc mỗi lần mở
      }
    }, [isOpen, meal]);

    if (!isOpen) return null;

    if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-5xl p-6 rounded-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Meal</h2>
          <button onClick={onClose} className="border rounded-2xl border-emerald-400 p-2">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Meal basic info */}
        <div className="mb-6 flex gap-4">
          {/* Meal name */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium text-gray-700 dark:text-gray-200">Meal Name</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600"
              value={form.meal_name}
              onChange={(e) => setForm(prev => ({ ...prev, meal_name: e.target.value }))}
            />

            {/* Servings */}
            <label className="mt-3 font-medium text-gray-700 dark:text-gray-200">Servings</label>
            <input
            type="number"
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600"
            value={form.servings}
            onChange={(e) => setForm(prev => ({ ...prev, servings: Number(e.target.value) }))}
            />

            {/* Cooking time */}
            <div className="mt-3 flex-1 flex flex-col gap-2">
                <label className="font-medium text-gray-700 dark:text-gray-200">Cooking Time</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={getHoursFromCookingTime(form.cooking_time)} // hàm parse giờ từ string
                        onChange={(e) => handleCookingTime(e.target.value, getMinutesFromCookingTime(form.cooking_time))}
                        className="w-20 p-2 border rounded-lg"
                        placeholder="0"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.preventDefault()}
                    />
                    <span className="text-gray-700 dark:text-gray-200">hours</span>

                    <input
                        type="number"
                        value={getMinutesFromCookingTime(form.cooking_time)} // hàm parse phút từ string
                        onChange={(e) => handleCookingTime(getHoursFromCookingTime(form.cooking_time), e.target.value)}
                        className="w-20 p-2 border rounded-lg"
                    />
                    <span className="text-gray-700 dark:text-gray-200">minutes</span>
                </div>
            </div>
          </div>
          
          {/* Meal image */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium text-gray-700 dark:text-gray-200">Image URL</label>
            
            {/* Preview image */}
            {mealForm.image_url && (
                <img
                src={mealForm.image_url}
                alt="Meal"
                className="w-full h-64 object-cover rounded-lg mb-2"
                />
            )}

            <input
                type="file"
                // accept="image/*"
                onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                    // reader.result là base64 string
                    setForm(prev => ({ ...prev, image_url: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                }
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Ingredients</h3>
            <div className="flex flex-col gap-2">
                {form.meal_ingredients.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                    <AutocompleteIngredientInput
                        value={"text"}
                        onSelect={(ing) => handleIngredientChange(index, "ingredient_name", ing.name, ing.calories)}
                        // placeholder={item.ingredient_id || "Type ingredient..."}
                    />

                    <input
                    type="text"
                    placeholder="0"
                    className="w-24 p-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    value={item.quantity}
                    onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                    />

                    <button onClick={() => removeIngredient(index)} className="text-red-500">
                    <Trash />
                    </button>
                </div>
                ))}
                <button onClick={addIngredient} className="flex items-center gap-2 text-emerald-600 font-medium mt-2">
                <Plus /> Add Ingredient
                </button>
            </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Instructions</h3>
          <div className="flex flex-col gap-2">
            {form.meal_instructions?.map((step, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="number"
                  className="w-16 p-2 rounded-lg border border-gray-300 dark:border-gray-600"
                  value={step.step}
                  onChange={(e) => handleInstructionChange(index, "step", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Type instruction"
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600"
                  value={step.instruction}
                  onChange={(e) => handleInstructionChange(index, "instruction", e.target.value)}
                />
                <button
                  onClick={() => removeInstruction(index)}
                  className="text-red-500"
                >
                  <Trash />
                </button>
              </div>
            ))}
            <button onClick={addInstruction} className="flex items-center gap-2 text-emerald-600 font-medium mt-2"><Plus /> Add Step</button>
          </div>
        </div>

        {/* Save & Cancel button */}
        <div className="flex justify-between gap-3 mt-5">
          <button
            className="px-6 py-2 w-full rounded-lg bg-gray-300 dark:bg-gray-700 text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 w-full rounded-lg bg-emerald-500 text-white"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
