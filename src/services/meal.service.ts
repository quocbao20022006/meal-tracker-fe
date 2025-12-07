import * as httpClient from '../lib/http-client';
import { MealResponse, PaginatedMeals, UpdateMealRequest } from '../types';

export const getAllMeals = async (page: number = 0) => {
  return httpClient.get<PaginatedMeals>('/meal/all?page=' + page);
};

export const getMealById = async (id: number) => {
  return httpClient.get<MealResponse>(`/meal/${id}`);
};

export const getSimilarMeals = async (id: number) => {
  return httpClient.get<MealResponse>(`/meal/${id}/recommendations`);
}

export const getMealsByCategory = async (category: string, page: number = 0) => {
  return httpClient.get<PaginatedMeals>(`/meal/filter?category=${category}&page=${page}`);
};

export const searchMeals = async (query: string) => {
  return httpClient.get<MealResponse[]>(`/meal/search?query=${query}`);
};

export const createMeal = async (meal: Omit<MealResponse, 'id'>) => {
  return httpClient.post<MealResponse>('/meals', meal);
};

export const updateMeal = async (id: number, meal: UpdateMealRequest) => {
  const formData = new FormData();

  // Tên field phải camelCase đúng với Java class
  formData.append("mealName", meal.mealName ?? "");
  formData.append("mealDescription", meal.mealDescription ?? "");
  formData.append("cookingTime", meal.cookingTime ?? "");
  formData.append("servings", String(meal.servings ?? 1));

  (meal.mealIngredients ?? []).forEach((ing, idx) => {
    formData.append(`mealIngredients[${idx}].ingredientId`, String(ing.ingredientId ?? ""));
    formData.append(`mealIngredients[${idx}].quantity`, String(ing.quantity ?? ""));
  });

  (meal.mealInstructions ?? []).forEach((ins, idx) => {
    formData.append(`mealInstructions[${idx}].step`, String(ins.step ?? ""));
    formData.append(`mealInstructions[${idx}].instruction`, ins.instruction ?? "");
  });

  (meal.nutrition ?? []).forEach((item, idx) => {
    formData.append(`nutrition[${idx}]`, item);
  });
  (meal.categoryName ?? []).forEach((item, idx) => {
    formData.append(`categoryName[${idx}]`, item);
  });

  if (meal.image instanceof File && meal.image.size > 0) {
    formData.append("image", meal.image, meal.image.name);
  }

  return httpClient.put<MealResponse>(`/meal/update/${id}`, formData);
};

export const deleteMeal = async (id: number) => {
  return httpClient.httpDelete(`/meals/${id}`);
};
