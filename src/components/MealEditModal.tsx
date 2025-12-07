import { useState, useEffect } from "react";
import { IngredientResponse, MealResponse, UpdateMealRequest } from "../types";
import { X, Plus, Trash } from "lucide-react";
import { updateMeal } from "../services/meal.service";
import AutocompleteIngredientInput from "./AutocompleteIngredientInput";

interface EditMealModalProps {
  meal: MealResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: MealResponse) => void;
}

type InstructionKey = "step" | "instruction";

export default function EditMealModal({
  meal,
  isOpen,
  onClose,
  onUpdate,
}: EditMealModalProps) {
  const [mealForm, setMealForm] = useState<MealResponse>(meal);
  const [form, setForm] = useState<UpdateMealRequest>({
    mealName: meal.name,
    mealDescription: meal.description || "",
    image: null, // chưa có ảnh mới
    mealIngredients: meal.mealIngredients
      .filter((ing) => ing && ing.ingredientId) // Chỉ lấy ingredients có id hợp lệ
      .map((ing) => ({
        ingredientId: ing.ingredientId || 0,
        quantity: ing.quantity || 0,
      })),
    mealInstructions: Array.isArray(meal.mealInstructions)
      ? meal.mealInstructions.map((ins) => ({
          step: ins.step,
          instruction: ins.instruction,
        }))
      : [],
    cookingTime: meal.cookingTime || "",
    servings: meal.servings || 1,
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Map để lưu ingredient names theo index để hiển thị
  const [ingredientNames, setIngredientNames] = useState<Map<number, string>>(
    new Map()
  );
    // Thêm state để quản lý localId
const [ingredientLocalIds, setIngredientLocalIds] = useState<number[]>([]);

  const handleIngredientChange = (
    index: number,
    ingredient: IngredientResponse
  ) => {
    setForm((prev) => {
      const arr = [...prev.mealIngredients];
      arr[index] = {
        ingredientId: ingredient.id,
        quantity: arr[index]?.quantity || 0,
        unit: ingredient.description ?? "grams",
      };
      return { ...prev, mealIngredients: arr };
    });
    // Cập nhật ingredient name để hiển thị
    setIngredientNames((prev) => {
      const newMap = new Map(prev);
      newMap.set(index, ingredient.name);
      return newMap;
    });
  };

  const handleInstructionChange = (
    index: number,
    key: InstructionKey,
    value: string
  ) => {
    setForm((prev) => {
      const arr = [...prev.mealInstructions];
      if (key === "step") {
        arr[index] = { ...arr[index], step: Number(value) || arr[index].step };
      } else if (key === "instruction") {
        arr[index] = { ...arr[index], instruction: value };
      }
      return { ...prev, mealInstructions: arr };
    });
  };

  // const addIngredient = () => {
  //   setForm((prev) => ({
  //     ...prev,
  //     mealIngredients: [
  //       ...prev.mealIngredients,
  //       { ingredientId: 0, quantity: 0 },
  //     ],
  //   }));
  // };



// Khi mở modal, khởi tạo localIds từ dữ liệu cũ
useEffect(() => {
  if (isOpen && meal) {
    // ... các setForm khác ...

    // Tạo localId cho các ingredient hiện có
    const localIds = meal.mealIngredients
      .filter(ing => ing && ing.ingredientId)
      .map((_, i) => Date.now() + i); // hoặc dùng crypto.randomUUID() nếu browser hỗ trợ

    setIngredientLocalIds(localIds);

    // ... reset ingredientNames như cũ ...
  }
}, [isOpen, meal]);

  const addIngredient = () => {
  const newLocalId = Date.now(); // hoặc crypto.randomUUID()

  setForm((prev) => ({
    ...prev,
    mealIngredients: [
      ...prev.mealIngredients,
      { ingredientId: 0, quantity: 0 },
    ],
  }));

  // Thêm localId mới
  setIngredientLocalIds((prev) => [...prev, newLocalId]);

  // Đảm bảo ingredientNames có entry cho index mới (dù rỗng)
  setIngredientNames((prev) => {
    const newMap = new Map(prev);
    newMap.set(prev.size, ""); // hoặc dùng newLocalId làm key nếu muốn
    return newMap;
  });
};

  const removeIngredient = (index: number) => {
    setForm((prev) => ({
      ...prev,
      mealIngredients: prev.mealIngredients.filter((_, i) => i !== index),
    }));
  };

  const addInstruction = () => {
    setForm((prev) => ({
      ...prev,
      mealInstructions: [
        ...(Array.isArray(prev.mealInstructions) ? prev.mealInstructions : []),
        {
          id: 0,
          step:
            (Array.isArray(prev.mealInstructions)
              ? prev.mealInstructions.length
              : 0) + 1,
          instruction: "",
        },
      ],
    }));
  };

  const removeInstruction = (index: number) => {
    setForm((prev) => ({
      ...prev,
      mealInstructions: prev.mealInstructions.filter((_, i) => i !== index),
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
    setForm((prev) => ({ ...prev, cookingTime: cookingTime }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate: đảm bảo tất cả ingredients có ingredient_id
      const validIngredients = form.mealIngredients.filter(
        (ing) => ing.ingredientId > 0
      );
      if (validIngredients.length !== form.mealIngredients.length) {
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
      onUpdate(result.data);
      onClose();
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && meal) {
      setLoading(false); // mở modal thì đảm bảo không bị block bởi loading
      setMealForm({ ...meal }); // reset lại form từ meal gốc mỗi lần mở
      setImagePreview(null); // reset preview khi mở modal

      // Reset form với dữ liệu từ meal
      setForm({
        mealName: meal.name,
        mealDescription: meal.description || "",
        image: null,
        mealIngredients: meal.mealIngredients
          .filter((ing) => ing && ing.ingredientId) // Chỉ lấy ingredients có id hợp lệ
          .map((ing) => ({
            ingredientId: ing.ingredientId || 0,
            quantity: ing.quantity || 0,
            unit: ing.unit || "",
          })),
        mealInstructions: Array.isArray(meal.mealInstructions)
          ? meal.mealInstructions.map((ins) => ({
              step: ins.step,
              instruction: ins.instruction,
            }))
          : [],
        cookingTime: meal.cookingTime || "",
        servings: meal.servings || 1,
      });

      // Reset ingredient names khi mở modal
      const nameMap = new Map<number, string>();
      if (
        Array.isArray(meal.mealIngredients) &&
        meal.mealIngredients.length > 0
      ) {
        meal.mealIngredients.forEach((ing, index) => {
          if (ing && ing.ingredientName) {
            nameMap.set(index, ing.ingredientName);
          }
        });
      }
      setIngredientNames(nameMap);
    }
  }, [isOpen, meal]);

  // Cleanup preview URL khi component unmount hoặc khi file thay đổi
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, []); // cleanup only on unmount

  if (!isOpen) return null;

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-5xl p-6 rounded-3xl shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Meal
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Meal Basic Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Meal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Name, Servings, Cooking Time */}
            <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
              {/* Meal name */}
              <label className="font-medium text-gray-700 dark:text-gray-200">
                Meal Name
              </label>
              <input
                type="text"
                className="w-full p-2 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                value={form.mealName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, mealName: e.target.value }))
                }
              />

              {/* Meal description */}
              <label className="font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                className="w-full p-2 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                value={form.mealDescription || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mealDescription: e.target.value,
                  }))
                }
              />

              {/* Servings + Cooking times */}
              <div className="flex justify-between items-center">
                {/* Servings */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">
                    Servings
                  </label>
                  <input
                    type="number"
                    className="p-2 w-20 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                    value={form.servings}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        servings: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                {/* Cooking time */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">
                    Cooking Time
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={getHoursFromCookingTime(form.cookingTime)}
                      onChange={(e) =>
                        handleCookingTime(
                          e.target.value,
                          getMinutesFromCookingTime(form.cookingTime)
                        )
                      }
                      className="w-20 p-2 border rounded-lg outline-none"
                    />
                    <span className="text-gray-700 dark:text-gray-200">
                      hours
                    </span>
                    <input
                      type="number"
                      value={getMinutesFromCookingTime(form.cookingTime)}
                      onChange={(e) =>
                        handleCookingTime(
                          getHoursFromCookingTime(form.cookingTime),
                          e.target.value
                        )
                      }
                      className="w-20 p-2 border rounded-lg outline-none"
                    />
                    <span className="text-gray-700 dark:text-gray-200">
                      minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Meal Image */}
            <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
              <label className="font-medium text-gray-700 dark:text-gray-200">
                Meal Image
              </label>
              {(imagePreview || mealForm.imageUrl) && (
                <img
                  src={imagePreview || mealForm.imageUrl || ""}
                  alt="Meal"
                  className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                />
              )}
              <input
                type="file"
                accept="image/*"
                id="meal-image-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // update form
                    setForm((prev) => ({ ...prev, image: file }));

                    // reset preview cũ, tạo preview mới
                    setImagePreview((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return URL.createObjectURL(file);
                    });
                  }
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900 dark:file:text-emerald-300"
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Ingredients
          </h3>
          <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
            {form.mealIngredients.map((item, index) => {
              const localId = ingredientLocalIds[index];
              return (
                <div
                  key={localId} 
                  className="flex flex-wrap md:flex-nowrap gap-2 items-center"
                >
                  <AutocompleteIngredientInput
                    value={ingredientNames.get(index) || ""}
                    onSelect={(ing) => handleIngredientChange(index, ing)}
                    placeholder="Type ingredient..."
                  />
                  <input
                    type="number"
                    className="w-24 p-2 rounded-lg border border-gray-300 dark:border-gray-600 outline-none"
                    value={item.quantity || 0}
                    onChange={(e) => {
                      setForm((prev) => {
                        const arr = [...prev.mealIngredients];
                        arr[index] = {
                          ...arr[index],
                          quantity: Number(e.target.value) || 0,
                        };
                        return { ...prev, mealIngredients: arr };
                      });
                    }}
                  />
                  <span className="w-1/5 p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-center bg-gray-100 dark:bg-gray-800">
                    {form.mealIngredients[index]?.unit || "unit"}
                  </span>
                  <button
                    onClick={() => {
                      removeIngredient(index);
                      setIngredientLocalIds(prev => prev.filter((_, i) => i !== index));
                      setIngredientNames(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(index);
                        const reordered = new Map();
                        let newIndex = 0;
                        for (const [oldIndex, value] of newMap.entries()) {
                          if (oldIndex !== index) {
                            reordered.set(newIndex++, value);
                          }
                        }
                        return reordered;
                      });
                    }}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
            <button
              className="flex items-center gap-2 text-emerald-600 font-medium mt-2 hover:text-emerald-700 transition"
              onClick={addIngredient}
            >
              <Plus /> Add Ingredient
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Instructions
          </h3>
          <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
            {form.mealInstructions?.map((step, index) => (
              <div
                key={index}
                className="flex flex-wrap md:flex-nowrap gap-2 items-center"
              >
                <input
                  type="number"
                  className="w-16 p-2 rounded-lg border border-gray-300 dark:border-gray-600 outline-none"
                  value={step.step}
                  onChange={(e) =>
                    handleInstructionChange(index, "step", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Type instruction"
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 outline-none"
                  value={step.instruction}
                  onChange={(e) =>
                    handleInstructionChange(
                      index,
                      "instruction",
                      e.target.value
                    )
                  }
                />
                <button
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash />
                </button>
              </div>
            ))}
            <button
              className="flex items-center gap-2 text-emerald-600 font-medium mt-2 hover:text-emerald-700 transition"
              onClick={addInstruction}
            >
              <Plus /> Add Step
            </button>
          </div>
        </div>

        {/* Save & Cancel */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-400 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

