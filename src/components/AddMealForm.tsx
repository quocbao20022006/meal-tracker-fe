import { useState, useEffect } from "react";
import { Plus, X, ChefHat, ArrowLeft, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMeal } from "../services/meal.service";
import AutocompleteIngredientInput from "./AutocompleteIngredientInput";
import AddMealSuccessToast from "./AddMealSuccessToast";

// Types
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

const AddMealForm = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [nutritionItems, setNutritionItems] = useState<string[]>([]);

  // Ingredient states
  const [ingredientNames, setIngredientNames] = useState<Map<number, string>>(
    new Map()
  );
  const [ingredientLocalIds, setIngredientLocalIds] = useState<number[]>([
    Date.now(),
  ]);

  const [form, setForm] = useState({
    mealName: "",
    mealDescription: "",
    image: null as File | null,
    mealIngredients: [
      { ingredientId: 0, quantity: 0, unit: "" },
    ] as MealIngredient[],
    mealInstructions: [{ step: 1, instruction: "" }] as MealInstruction[],
    cookingTime: "",
    servings: 1,
    calories: "",
  });

  const categoryOptions = [
    "appetizer",
    "main dish",
    "soup",
    "salad",
    "snack",
    "dessert",
    "beverage",
  ];

  // const { toast } = useToast();

  // Fetch ingredients from backend
  // useEffect(() => {
  //   const fetchIngredients = async () => {
  //     try {
  //       const response = await axios.get("/api/ingredients");
  //       setAllIngredients(response.data);
  //     } catch (error) {
  //       console.error("Error fetching ingredients:", error);
  //     }
  //   };
  //   fetchIngredients();
  // }, []);

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Category handlers
  const handleAddCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove));
  };

  // Nutrition handlers
  const handleAddNutrition = () => {
    const input = document.getElementById(
      "nutrition-input"
    ) as HTMLInputElement;
    const value = input?.value?.trim();
    if (value && !nutritionItems.includes(value)) {
      setNutritionItems([...nutritionItems, value]);
      input.value = "";
    }
  };

  const handleRemoveNutrition = (item: string) => {
    setNutritionItems(nutritionItems.filter((n) => n !== item));
  };

  // Ingredient handlers
  const addIngredient = () => {
    const newLocalId = Date.now();
    setForm((prev) => ({
      ...prev,
      mealIngredients: [
        ...prev.mealIngredients,
        { ingredientId: 0, quantity: 0, unit: "" },
      ],
    }));
    setIngredientLocalIds((prev) => [...prev, newLocalId]);
    setIngredientNames((prev) => {
      const newMap = new Map(prev);
      newMap.set(prev.size, "");
      return newMap;
    });
  };

  const removeIngredient = (index: number) => {
    setForm((prev) => ({
      ...prev,
      mealIngredients: prev.mealIngredients.filter((_, i) => i !== index),
    }));
    setIngredientLocalIds((prev) => prev.filter((_, i) => i !== index));
    setIngredientNames((prev) => {
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
  };

  // Ingredient handlers
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

  // Instruction handlers
  const addInstruction = () => {
    setForm((prev) => ({
      ...prev,
      mealInstructions: [
        ...prev.mealInstructions,
        { step: prev.mealInstructions.length + 1, instruction: "" },
      ],
    }));
  };

  const removeInstruction = (index: number) => {
    const updated = form.mealInstructions.filter((_, i) => i !== index);
    updated.forEach((item, i) => {
      item.step = i + 1;
    });
    setForm({ ...form, mealInstructions: updated });
  };

  const handleInstructionChange = (
    index: number,
    field: "step" | "instruction",
    value: string
  ) => {
    const updated = [...form.mealInstructions];
    if (field === "step") {
      updated[index] = {
        ...updated[index],
        step: Number(value) || updated[index].step,
      };
    } else {
      updated[index] = { ...updated[index], instruction: value };
    }
    setForm({ ...form, mealInstructions: updated });
  };

  // Cooking time handlers
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

  const handleCookingTime = (hours: string, minutes: string) => {
    let cookingTime = "";
    const h = Number(hours);
    const m = Number(minutes);

    if (h > 0) cookingTime += `${h} hour${h > 1 ? "s" : ""} `;
    if (m > 0) cookingTime += `${m} minute${m > 1 ? "s" : ""}`;

    setForm({ ...form, cookingTime: cookingTime.trim() });
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!form.mealName || !form.servings || !form.cookingTime) {
      alert(
        "Please fill in all required fields (Name, Servings, Cooking Time)"
      );
      return;
    }

    const validIngredients = form.mealIngredients.filter(
      (ing) => ing.ingredientId > 0
    );
    if (validIngredients.length === 0) {
      alert("Please add at least one ingredient!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("mealName", form.mealName);
      formData.append("mealDescription", form.mealDescription);
      formData.append("cookingTime", form.cookingTime);
      formData.append("servings", form.servings.toString());
      // formData.append("calories", form.calories);

      if (form.image) {
        formData.append("image", form.image);
      }

      formData.append("mealIngredients", JSON.stringify(validIngredients));
      formData.append(
        "mealInstructions",
        JSON.stringify(
          form.mealInstructions.filter((ins) => ins.instruction.trim())
        )
      );
      formData.append("categories", JSON.stringify(categories));
      formData.append("nutrition", JSON.stringify(nutritionItems));

      // const response = await axios.post("/api/meals", formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      const result = await createMeal(form);

      if (result.error) {
        console.error("Update error:", result.error);
        return;
      } else if (!result.data) {
        console.error("No data returned from API");
        return;
      } else {
        alert("Meal added successfully!");
        <AddMealSuccessToast></AddMealSuccessToast>

        // Reset form
        setForm({
          mealName: "",
          mealDescription: "",
          image: null,
          mealIngredients: [{ ingredientId: 0, quantity: 0, unit: "" }],
          mealInstructions: [{ step: 1, instruction: "" }],
          cookingTime: "",
          servings: 1,
          calories: "",
        });
        setCategories([]);
        setNutritionItems([]);
        setIngredientNames(new Map());
        setIngredientLocalIds([Date.now()]);
        setImagePreview(null);
        window.history.back();
      }
    } catch (error) {
      console.error("Error adding meal:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add Custom Meal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create your own delicious meal recipe
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information Card */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your meal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Meal Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Grilled Salmon with Vegetables"
                      value={form.mealName}
                      onChange={(e) =>
                        setForm({ ...form, mealName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your meal..."
                      value={form.mealDescription}
                      onChange={(e) =>
                        setForm({ ...form, mealDescription: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">Servings *</Label>
                      <Input
                        id="servings"
                        type="number"
                        value={form.servings}
                        onChange={(e) =>
                          setForm({ ...form, servings: Number(e.target.value) })
                        }
                      />
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="calories">Calories *</Label>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="e.g., 350"
                        value={form.calories}
                        onChange={(e) =>
                          setForm({ ...form, calories: e.target.value })
                        }
                      />
                    </div> */}
                  </div>

                  <div className="space-y-2">
                    <Label>Cooking Time *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={getHoursFromCookingTime(form.cookingTime)}
                        onChange={(e) =>
                          handleCookingTime(
                            e.target.value,
                            getMinutesFromCookingTime(form.cookingTime)
                          )
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        hours
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={getMinutesFromCookingTime(form.cookingTime)}
                        onChange={(e) =>
                          handleCookingTime(
                            getHoursFromCookingTime(form.cookingTime),
                            e.target.value
                          )
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image */}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="image">Meal Image</Label>

                  {/* Upload Box / Preview */}
                  {!imagePreview ? (
                    <label
                      htmlFor="image"
                      className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l3 3m-3-3l-3 3m9-7h3m-6 0h.01M3 9h3m-6 0h.01M12 3v9"
                        />
                      </svg>

                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Click to upload image
                      </span>
                    </label>
                  ) : (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                      />

                      {/* Button Change Image (overlay) */}
                      <label
                        htmlFor="image"
                        className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm px-3 py-1.5 rounded-lg shadow cursor-pointer border hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        Change Image
                      </label>
                    </div>
                  )}

                  {/* Hidden input */}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2 mt-6">
                <Label>Categories</Label>
                <Select onValueChange={handleAddCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="hover:text-emerald-900 dark:hover:text-emerald-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Nutrition */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="nutrition-input">Nutrition Facts</Label>
                <div className="flex gap-2">
                  <Input
                    id="nutrition-input"
                    placeholder="e.g., Protein 25g"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddNutrition())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddNutrition}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {nutritionItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {nutritionItems.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveNutrition(item)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Card */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                List all ingredients needed for this meal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                {form.mealIngredients.map((item, index) => {
                  const localId = ingredientLocalIds[index];
                  return (
                    <div key={localId} className="relative">
                      <div className="flex gap-2 items-center">
                        {/* Ingredient Name with Autocomplete */}
                        <div className="flex-[8]">
                          <AutocompleteIngredientInput
                            value={ingredientNames.get(index) || ""}
                            onSelect={(ing) =>
                              handleIngredientChange(index, ing)
                            }
                            placeholder="Type ingredient..."
                          />
                        </div>

                        {/* Quantity */}
                        <div className="flex-[2]">
                          <Input
                            type="number"
                            placeholder="Qty"
                            className="w-full rounded-lg"
                            value={item.quantity || ""}
                            onChange={(e) => {
                              const updated = [...form.mealIngredients];
                              updated[index] = {
                                ...updated[index],
                                quantity: Number(e.target.value) || 0,
                              };
                              setForm({ ...form, mealIngredients: updated });
                            }}
                          />
                        </div>

                        {/* Unit - display only */}
                        <div className="flex-[2]">
                          <div
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                    bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-700 
                    dark:text-gray-300"
                          >
                            {item.unit || "unit"}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="flex-[1] flex justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIngredient(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full mt-2 border-dashed border-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Cooking Instructions</CardTitle>
              <CardDescription>
                Step-by-step guide to prepare this meal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                {form.mealInstructions.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                      {item.step}
                    </div>
                    <Input
                      type="text"
                      placeholder="Type instruction"
                      className="flex-1"
                      value={item.instruction}
                      onChange={(e) =>
                        handleInstructionChange(
                          index,
                          "instruction",
                          e.target.value
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInstruction}
                  className="w-full mt-2 border-dashed border-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {/* Add meal button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r text-base from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              {loading ? "Adding..." : "Add Meal"}
            </Button>

            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full h-12 text-base py-2 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMealForm;
