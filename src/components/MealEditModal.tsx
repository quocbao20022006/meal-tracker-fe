import { useState, useEffect } from "react";
import { IngredientResponse, MealResponse, UpdateMealRequest } from "../types";
import { X, Plus, Trash } from "lucide-react";
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
      meal_ingredients: meal.meal_ingredients
        .filter(ing => ing && ing.id) // Chỉ lấy ingredients có id hợp lệ
        .map(ing => ({
          ingredient_id: ing.id || 0,
          quantity: ing.quantity || 0
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

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    // Map để lưu ingredient names theo index để hiển thị
    const [ingredientNames, setIngredientNames] = useState<Map<number, string>>(new Map());

    const handleIngredientChange = (
      index: number, 
      ingredient: IngredientResponse
    ) => {
      setForm(prev => {
        const arr = [...prev.meal_ingredients];
        arr[index] = {
          ingredient_id: ingredient.id,
          quantity: arr[index]?.quantity || 0
        };
        return { ...prev, meal_ingredients: arr };
      });
      // Cập nhật ingredient name để hiển thị
      setIngredientNames(prev => {
        const newMap = new Map(prev);
        newMap.set(index, ingredient.name);
        return newMap;
      });
    };

    const handleInstructionChange = (index: number, key: InstructionKey, value: string) => {
      setForm(prev => {
        const arr = [...prev.meal_instructions];
        if (key === "step") {
          arr[index] = { ...arr[index], step: Number(value) || arr[index].step };
        } else if (key === "instruction") {
          arr[index] = { ...arr[index], instruction: value };
        }
        return { ...prev, meal_instructions: arr };
      });
    };

    const addIngredient = () => {
      setForm(prev => ({
        ...prev,
        meal_ingredients: [...prev.meal_ingredients, { ingredient_id: 0, quantity: 0 }]
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
        
        // Validate: đảm bảo tất cả ingredients có ingredient_id
        const validIngredients = form.meal_ingredients.filter(ing => ing.ingredient_id > 0);
        if (validIngredients.length !== form.meal_ingredients.length) {
          alert("Please select all ingredients before saving!");
          setLoading(false);
          return;
        }
        
        // Gọi API lưu xuống backend
        const result = await updateMeal(meal.id, form);
        
        // Kiểm tra error từ response
        if (result.error) {
          console.error("Update error:", result.error);
          return;
        }

        if (!result.data) {
          console.error("No data returned from API");
          return;
        }

        // Cập nhật UI sau khi API thành công
        onUpdate(form);
        onClose();
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };


    useEffect(() => {
      if (isOpen && meal) {
        setLoading(false);  // mở modal thì đảm bảo không bị block bởi loading
        setMealForm({ ...meal }); // reset lại form từ meal gốc mỗi lần mở
        setImagePreview(null); // reset preview khi mở modal
        
        // Reset form với dữ liệu từ meal
        setForm({
          meal_name: meal.meal_name,
          image: null,
          meal_ingredients: meal.meal_ingredients
            .filter(ing => ing && ing.id) // Chỉ lấy ingredients có id hợp lệ
            .map(ing => ({
              ingredient_id: ing.id || 0,
              quantity: ing.quantity || 0
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
        
        // Reset ingredient names khi mở modal
        const nameMap = new Map<number, string>();
        if (Array.isArray(meal.meal_ingredients) && meal.meal_ingredients.length > 0) {
          meal.meal_ingredients.forEach((ing, index) => {
            if (ing && ing.ingredient_name) {
              nameMap.set(index, ing.ingredient_name);
            }
          });
        }
        setIngredientNames(nameMap);
      }
    }, [isOpen, meal]);

    // Cleanup preview URL khi component unmount hoặc khi file thay đổi
    useEffect(() => {
      return () => {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
      };
    }, [imagePreview]);

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
            <label className="font-medium text-gray-700 dark:text-gray-200">Meal Image</label>
            
            {/* Preview image */}
            {(imagePreview || mealForm.image_url) && (
                <img
                src={imagePreview || mealForm.image_url || ""}
                alt="Meal"
                className="w-full h-64 object-cover rounded-lg mb-2"
                />
            )}

            <div className="relative">
              <input
                  type="file"
                  accept="image/*"
                  id="meal-image-input"
                  onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                      // Lưu File object vào form state
                      setForm(prev => ({ ...prev, image: file }));
                      // Cleanup preview URL cũ nếu có
                      if (imagePreview) {
                          URL.revokeObjectURL(imagePreview);
                      }
                      // Tạo preview URL từ File object
                      const previewUrl = URL.createObjectURL(file);
                      setImagePreview(previewUrl);
                  }
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900 dark:file:text-emerald-300"
              />
            </div>
            {form.image && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selected: {form.image.name}
              </p>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Ingredients</h3>
            <div className="flex flex-col gap-2">
                {form.meal_ingredients.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                    <AutocompleteIngredientInput
                        value={ingredientNames.get(index) || ""}
                        onSelect={(ing) => handleIngredientChange(index, ing)}
                        placeholder="Type ingredient..."
                    />

                    <input
                    type="number"
                    placeholder="0"
                    className="w-24 p-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    value={item.quantity}
                    onChange={(e) => {
                      setForm(prev => {
                        const arr = [...prev.meal_ingredients];
                        arr[index] = { ...arr[index], quantity: Number(e.target.value) || 0 };
                        return { ...prev, meal_ingredients: arr };
                      });
                    }}
                    />

                    <button onClick={() => {
                      removeIngredient(index);
                      setIngredientNames(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(index);
                        return newMap;
                      });
                    }} className="text-red-500">
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
