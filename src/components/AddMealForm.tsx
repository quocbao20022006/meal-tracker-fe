import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { getAllCategories } from "../services/category.service";
import { CategoryResponse } from "../types";
import AutocompleteIngredientInput from "./AutocompleteIngredientInput";

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
  name?: string; // For display purposes
}

interface MealInstruction {
  step: number;
  instruction: string;
}

interface MealFormData {
  mealName: string;
  mealDescription: string;
  image: File | null;
  mealIngredients: MealIngredient[];
  mealInstructions: MealInstruction[];
  cookingTime: string;
  cookingTimeHours: string;
  cookingTimeMinutes: string;
  servings: number;
  calories: string;
  categories: number[];
  nutrition: string[];
}

export default function AddMealForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryResponse[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    CategoryResponse[]
  >([]);
  const [nutritionInput, setNutritionInput] = useState("");

  // Initialize React Hook Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<MealFormData>({
    defaultValues: {
      mealName: "",
      mealDescription: "",
      image: null,
      mealIngredients: [{ ingredientId: 0, quantity: 0, unit: "", name: "" }],
      mealInstructions: [{ step: 1, instruction: "" }],
      cookingTime: "",
      cookingTimeHours: "0",
      cookingTimeMinutes: "0",
      servings: 1,
      calories: "",
      categories: [],
      nutrition: [],
    },
  });

  // Field Arrays for dynamic fields
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "mealIngredients",
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: "mealInstructions",
  });

  const [nutritionItems, setNutritionItems] = useState<string[]>([]);

  // Watch cooking time fields
  const cookingTimeHours = watch("cookingTimeHours");
  const cookingTimeMinutes = watch("cookingTimeMinutes");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        if (res.data) {
          setAllCategories(res.data.content);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  // Update cooking time whenever hours or minutes change
  useEffect(() => {
    const h = Number(cookingTimeHours) || 0;
    const m = Number(cookingTimeMinutes) || 0;
    let cookingTime = "";

    if (h > 0) cookingTime += `${h} hour${h > 1 ? "s" : ""} `;
    if (m > 0) cookingTime += `${m} minute${m > 1 ? "s" : ""}`;

    setValue("cookingTime", cookingTime.trim());
  }, [cookingTimeHours, cookingTimeMinutes, setValue]);

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Category handlers
  const handleAddCategory = (category: CategoryResponse) => {
    if (!selectedCategories.some((c) => c.id === category.id)) {
      const newCategories = [...selectedCategories, category];
      setSelectedCategories(newCategories);
      setValue(
        "categories",
        newCategories.map((c) => c.id)
      );
    }
  };

  const handleRemoveCategory = (id: number) => {
    const newCategories = selectedCategories.filter((c) => c.id !== id);
    setSelectedCategories(newCategories);
    setValue(
      "categories",
      newCategories.map((c) => c.id)
    );
  };

  // Nutrition handlers
  const handleAddNutrition = () => {
    const value = nutritionInput.trim();
    const currentNutrition = getValues("nutrition");

    if (value && !currentNutrition.includes(value)) {
      const newNutrition = [...currentNutrition, value];
      setNutritionItems(newNutrition);
      setValue("nutrition", newNutrition);
      setNutritionInput("");
    }
  };

  const handleRemoveNutrition = (item: string) => {
    const newNutrition = nutritionItems.filter((n) => n !== item);
    setNutritionItems(newNutrition);
    setValue("nutrition", newNutrition); // Sync với RHF
  };

  // Ingredient handlers
  const handleIngredientChange = (
    index: number,
    ingredient: IngredientResponse
  ) => {
    const currentIngredients = getValues("mealIngredients");
    const updatedIngredient = {
      ...currentIngredients[index],
      ingredientId: ingredient.id,
      unit: ingredient.description ?? "grams",
      name: ingredient.name,
    };

    setValue(`mealIngredients.${index}`, updatedIngredient);
  };

  const addIngredient = () => {
    appendIngredient({ ingredientId: 0, quantity: 0, unit: "", name: "" });
  };

  // Instruction handlers
  const addInstruction = () => {
    const currentInstructions = getValues("mealInstructions");
    appendInstruction({
      step: currentInstructions.length + 1,
      instruction: "",
    });
  };

  const handleRemoveInstruction = (index: number) => {
    removeInstruction(index);
    // Reorder steps
    const instructions = getValues("mealInstructions");
    instructions.forEach((_, i) => {
      setValue(`mealInstructions.${i}.step`, i + 1);
    });
  };

  // Submit handler
  const onSubmit = async (data: MealFormData) => {
    if (!data.mealName || !data.servings || !data.cookingTime) {
      alert(
        "Please fill in all required fields (Name, Servings, Cooking Time)"
      );
      return;
    }

    const validIngredients = data.mealIngredients.filter(
      (ing) => ing.ingredientId > 0
    );

    if (validIngredients.length === 0) {
      alert("Please add at least one ingredient!");
      return;
    }

    try {
      const formData = new FormData();

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user || !user.id) {
        console.log("User not found. Please log in again.");
        toast.error("Add new meal failed.");
        setLoading(false);
        return;
      }

      setLoading(true);

      formData.append("userId", user.id);
      formData.append("mealName", data.mealName);
      formData.append("mealDescription", data.mealDescription);
      formData.append("cookingTime", data.cookingTime);
      formData.append("servings", data.servings.toString());

      if (data.image) {
        formData.append("image", data.image);
      }

      // ingredients
      validIngredients.forEach((ing, i) => {
        formData.append(
          `mealIngredients[${i}].ingredientId`,
          String(ing.ingredientId)
        );
        formData.append(`mealIngredients[${i}].quantity`, String(ing.quantity));
        formData.append(`mealIngredients[${i}].unit`, ing.unit || "");
      });

      // instructions
      data.mealInstructions.forEach((ins, i) => {
        formData.append(`mealInstructions[${i}].step`, String(ins.step));
        formData.append(`mealInstructions[${i}].instruction`, ins.instruction);
      });

      // categories
      data.categories.forEach((c) => {
        formData.append("categories", String(c));
      });

      // nutrition
      data.nutrition.forEach((n, i) => {
        formData.append(`nutrition[${i}]`, n);
      });

      console.log("Submitting form data:", data);

      const result = await createMeal(formData);

      if (result.error) {
        console.error("Update error:", result.error);
        return;
      } else if (!result.data) {
        console.error("No data returned from API");
        return;
      } else {
        toast.success("Created new meal successfully!");

        // Reset form
        reset();
        setSelectedCategories([]);
        setNutritionInput("");
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);

        window.history.back();
      }
    } catch (error) {
      console.error("Error adding meal:", error);

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
    <div className="h-screen w-full overflow-y-auto bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <button
          onClick={() => navigate("/meals")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> <span>Back</span>
        </button>
      </div>

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
                  {/* Meal name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Meal Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter meal name..."
                      {...register("mealName", { required: true })}
                    />
                    {errors.mealName && (
                      <span className="text-red-500 text-sm">
                        This field is required
                      </span>
                    )}
                  </div>

                  {/* Meal description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your meal..."
                      {...register("mealDescription")}
                      rows={3}
                    />
                  </div>

                  {/* Servings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">Servings *</Label>
                      <Input
                        id="servings"
                        type="number"
                        {...register("servings", {
                          required: true,
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>

                  {/* Cooking time */}
                  <div className="space-y-2">
                    <Label>Cooking Time *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        {...register("cookingTimeHours")}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        hours
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register("cookingTimeMinutes")}
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
                      <label
                        htmlFor="image"
                        className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm px-3 py-1.5 rounded-lg shadow cursor-pointer border hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        Change Image
                      </label>
                    </div>
                  )}

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
              <div className="space-y-3 mt-6">
                <Label className="text-sm font-medium">Categories</Label>
                <div className="relative">
                  <Select
                    onValueChange={(value) => {
                      const cat = allCategories.find(
                        (c) => c.id === Number(value)
                      );
                      if (cat) {
                        handleAddCategory(cat);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected category chips */}
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium"
                    >
                      <span className="text-sm">{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat.id)}
                        className="hover:text-emerald-900 dark:hover:text-emerald-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="nutrition-input">Nutrition Facts</Label>
                <div className="flex gap-2">
                  <Input
                    id="nutrition-input"
                    placeholder="e.g., Protein 25g"
                    value={nutritionInput}
                    onChange={(e) => setNutritionInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNutrition();
                      }
                    }}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium"
                      >
                        {item}
                        <button onClick={() => handleRemoveNutrition(item)}>
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
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="relative">
                    <div className="flex gap-2 items-center">
                      {/* Ingredient Name with Autocomplete */}
                      <div className="flex-[8]">
                        <Controller
                          control={control}
                          name={`mealIngredients.${index}.name`}
                          render={({ field: { value } }) => (
                            <AutocompleteIngredientInput
                              value={value || ""}
                              onSelect={(ing) =>
                                handleIngredientChange(index, ing)
                              }
                              placeholder="Type ingredient..."
                            />
                          )}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="flex-[2]">
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="w-full rounded-lg"
                          {...register(`mealIngredients.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      {/* Unit - display only */}
                      <div className="flex-[2]">
                        <div className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-700 dark:text-gray-300">
                          {watch(`mealIngredients.${index}.unit`) || "unit"}
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
                ))}
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
                {instructionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                      {index + 1}
                    </div>
                    <Input
                      type="text"
                      placeholder="Type instruction"
                      className="flex-1"
                      {...register(`mealInstructions.${index}.instruction`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInstruction(index)}
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
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r text-base from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              {loading ? "Adding..." : "Add Meal"}
            </Button>

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
}
