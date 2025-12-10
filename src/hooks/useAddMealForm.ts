import { useEffect, useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { createMeal } from "../services/meal.service";
import { getAllCategories } from "../services/category.service";
import type { CategoryResponse } from "../types";

/** Types copied/compatible với file gốc */
interface IngredientResponse {
  id: number;
  name: string;
  description: string | null;
}

interface MealIngredient {
  ingredientId: number;
  quantity: number;
  unit?: string;
}

interface MealInstruction {
  step: number;
  instruction: string;
}

/** Shape of RHF form values (mirrors original `form` state) */
export interface AddMealFormValues {
  mealName: string;
  mealDescription: string;
  image: File | null;
  mealIngredients: MealIngredient[];
  mealInstructions: MealInstruction[];
  cookingTime: string;
  servings: number;
  calories: string;
  categories: number[]; // numeric ids
  nutrition: string[];
}

/**
 * Hook chứa toàn bộ logic form đã refactor sang react-hook-form
 * Trả về: methods (register, control, handleSubmit, watch, setValue), plus handlers & UI state.
 */
export default function useAddMealForm() {
  // local UI state
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryResponse[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    CategoryResponse[]
  >([]);
  const [nutritionItems, setNutritionItems] = useState<string[]>([]);

  // keep a map of ingredient display names (for Autocomplete value)
  const [ingredientNames, setIngredientNames] = useState<Map<number, string>>(
    new Map()
  );
  // local ids for keying list items in UI (keeps parity with file-gốc approach)
  const [ingredientLocalIds, setIngredientLocalIds] = useState<number[]>(
    () => [Date.now()]
  );

  // --- react-hook-form setup ---
  const methods: UseFormReturn<AddMealFormValues> = useForm<
    AddMealFormValues
  >({
    defaultValues: {
      mealName: "",
      mealDescription: "",
      image: null,
      mealIngredients: [{ ingredientId: 0, quantity: 0, unit: "" }],
      mealInstructions: [{ step: 1, instruction: "" }],
      cookingTime: "",
      servings: 1,
      calories: "",
      categories: [],
      nutrition: [],
    },
  });

  const { control, watch, setValue, getValues, reset, register, handleSubmit } =
    methods;

  // field arrays for dynamic lists
  const ingredientsFA = useFieldArray({
    control,
    name: "mealIngredients",
  });
  const instructionsFA = useFieldArray({
    control,
    name: "mealInstructions",
  });

  // fetch categories once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllCategories();
        if (!mounted) return;
        if (res?.data?.content) setAllCategories(res.data.content);
      } catch (err) {
        console.error("getAllCategories err:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Handlers to plug into UI ---

  // Image input handler: set RHF file and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValue("image", file);
    if (imagePreview) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  // categories - keep both selectedCategories (for chip display) and RHF numeric ids
  const handleAddCategory = (category: CategoryResponse) => {
    if (!selectedCategories.some((c) => c.id === category.id)) {
      setSelectedCategories((prev) => [...prev, category]);
      // update RHF categories array (unique)
      const current = getValues("categories") || [];
      if (!current.includes(category.id)) setValue("categories", [...current, category.id]);
    }
  };

  const handleRemoveCategory = (id: number) => {
    setSelectedCategories((prev) => prev.filter((c) => c.id !== id));
    setValue(
      "categories",
      (getValues("categories") || []).filter((cid) => cid !== id)
    );
  };

  // nutrition input management (UI uses an <input id="nutrition-input"> in original)
  const handleAddNutrition = (value?: string) => {
    const valFromArg = value ?? (() => {
      const el = document.getElementById("nutrition-input") as HTMLInputElement | null;
      return el?.value?.trim() ?? "";
    })();
    const val = String(valFromArg ?? "").trim();
    if (!val) return;
    const current = getValues("nutrition") || [];
    if (!current.includes(val)) {
      setValue("nutrition", [...current, val]);
      setNutritionItems((prev) => [...prev, val]);
    }
    // clear input if using DOM input
    const el = document.getElementById("nutrition-input") as HTMLInputElement | null;
    if (el) el.value = "";
  };

  const handleRemoveNutrition = (item: string) => {
    setValue(
      "nutrition",
      (getValues("nutrition") || []).filter((n) => n !== item)
    );
    setNutritionItems((prev) => prev.filter((n) => n !== item));
  };

  // Ingredients handlers: add/remove are via field array helpers
  const addIngredient = () => {
    ingredientsFA.append({ ingredientId: 0, quantity: 0, unit: "" });
    setIngredientLocalIds((prev) => [...prev, Date.now()]);
    setIngredientNames((prev) => {
      const m = new Map(prev);
      m.set(prev.size, "");
      return m;
    });
  };

  const removeIngredient = (index: number) => {
    ingredientsFA.remove(index);
    // maintain local keys and names
    setIngredientLocalIds((prev) => prev.filter((_, i) => i !== index));
    setIngredientNames((prev) => {
      const newMap = new Map<number, string>();
      let idx = 0;
      for (const [k, v] of prev.entries()) {
        if (k === index) continue;
        newMap.set(idx++, v);
      }
      return newMap;
    });
  };

  // Called when AutocompleteIngredientInput selects an ingredient
  const handleIngredientSelect = (index: number, ingredient: IngredientResponse) => {
    // update RHF fields
    setValue(`mealIngredients.${index}.ingredientId`, ingredient.id);
    setValue(`mealIngredients.${index}.unit`, ingredient.description ?? "grams");
    // keep displayed name mapping for Autocomplete value prop
    setIngredientNames((prev) => {
      const m = new Map(prev);
      m.set(index, ingredient.name);
      return m;
    });
  };

  // Instruction handlers via field array helpers
  const addInstruction = () => {
    const cur = (getValues("mealInstructions") || []) as MealInstruction[];
    const nextStep = cur.length + 1;
    instructionsFA.append({ step: nextStep, instruction: "" });
  };

  const removeInstruction = (index: number) => {
    instructionsFA.remove(index);
    // fix step numbers after removal
    const remaining = (getValues("mealInstructions") || []) as MealInstruction[];
    const normalized = remaining.map((it, i) => ({ ...it, step: i + 1 }));
    setValue("mealInstructions", normalized);
  };

  // Instruction change: you can use register for inputs; this is provided in case you need to programmatically change
  const handleInstructionChange = (index: number, value: string) => {
    setValue(`mealInstructions.${index}.instruction`, value);
  };

  // Cooking time helpers: keep same string format as original (e.g., "1 hour 30 minutes")
  const getHoursFromCookingTime = (time: string) => {
    if (!time) return "0";
    const match = time.match(/(\d+)\s*hour/);
    return match ? match[1] : "0";
  };

  const getMinutesFromCookingTime = (time: string) => {
    if (!time) return "0";
    const match = time.match(/(\d+)\s*minute/);
    return match ? match[1] : "0";
  };

  const handleCookingTime = (hours: string | number, minutes: string | number) => {
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    let cookingTime = "";
    if (h > 0) cookingTime += `${h} hour${h > 1 ? "s" : ""} `;
    if (m > 0) cookingTime += `${m} minute${m > 1 ? "s" : ""}`;
    setValue("cookingTime", cookingTime.trim());
  };

  // --- Submit: creates FormData and calls createMeal ---
  const onSubmit = async (data: AddMealFormValues) => {
    // basic validation same as original
    if (!data.mealName || !data.servings || !data.cookingTime) {
      alert("Please fill in all required fields (Name, Servings, Cooking Time)");
      return;
    }
    const validIngredients = (data.mealIngredients || []).filter((ing) => ing.ingredientId > 0);
    if (validIngredients.length === 0) {
      alert("Please add at least one ingredient!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("mealName", data.mealName);
      formData.append("mealDescription", data.mealDescription || "");
      formData.append("cookingTime", data.cookingTime || "");
      formData.append("servings", String(data.servings || 1));

      if (data.image) formData.append("image", data.image);

      formData.append("mealIngredients", JSON.stringify(validIngredients));
      formData.append(
        "mealInstructions",
        JSON.stringify(
          (data.mealInstructions || []).filter((ins) => ins.instruction && ins.instruction.trim())
        )
      );

      // categories: prefer RHF categories if set, else fallback to selectedCategories ids (keeps original behavior)
      const categoriesFromForm = data.categories && data.categories.length > 0 ? data.categories : selectedCategories.map((c) => c.id);
      formData.append("categories", JSON.stringify(categoriesFromForm));
      formData.append("nutrition", JSON.stringify(data.nutrition || nutritionItems));

      // NOTE: original createMeal sometimes expected `form` object. Here we pass FormData.
      // If your backend expects JSON, change accordingly.
      const result = await createMeal(formData);

      if (result?.error) {
        console.error("Update error:", result.error);
        alert("Error when creating meal");
        return;
      }
      if (!result?.data) {
        console.error("No data returned from API");
        alert("No data returned from API");
        return;
      }

      alert("Meal added successfully!");
      // you can show AddMealSuccessToast in UI when this hook returns success state

      // reset everything
      reset();
      setNutritionItems([]);
      setIngredientNames(new Map());
      setIngredientLocalIds([Date.now()]);
      setSelectedCategories([]);
      if (imagePreview) {
        try { URL.revokeObjectURL(imagePreview); } catch {}
      }
      setImagePreview(null);
      // original: window.history.back(); keep optional (UI can call it)
    } catch (err) {
      console.error("Error adding meal:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // cleanup preview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
    };
  }, [imagePreview]);

  return {
    // react-hook-form helpers (spread into your UI)
    methods, // full react-hook-form methods object if you want <FormProvider {...methods}>
    register,
    control,
    handleSubmit, // use handleSubmit(onSubmit) in your Add button
    watch,
    setValue,
    getValues,
    reset,

    // field array helpers & state
    ingredientsFA,
    instructionsFA,
    ingredientNames,
    ingredientLocalIds,

    // UI state
    loading,
    imagePreview,
    allCategories,
    selectedCategories,
    nutritionItems,

    // handlers to wire into UI
    handleImageChange,
    handleAddCategory,
    handleRemoveCategory,
    handleAddNutrition,
    handleRemoveNutrition,
    addIngredient,
    removeIngredient,
    handleIngredientSelect,
    addInstruction,
    removeInstruction,
    handleInstructionChange,
    getHoursFromCookingTime,
    getMinutesFromCookingTime,
    handleCookingTime,

    // submit logic
    onSubmit,
  };
}
