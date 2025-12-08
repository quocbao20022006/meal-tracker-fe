import * as httpClient from "../lib/http-client";
import {
  CreateMealPlanItemRequest,
  MealPlanItemRequest,
  MealPlanItemResponse,
  PaginatedMealPlanItems,
} from "../types";

export const getMealPlanItemsByDate = async (params: MealPlanItemRequest) => {
  return httpClient.get<PaginatedMealPlanItems>(
    `/mealplanitem/all?${
      params.mealPlanId ? `mealPlanId=${params.mealPlanId}` : ""
    }${params.date ? `&date=${params.date}` : ""}`
  );
};

export const createMealPlanItem = async (
  request: CreateMealPlanItemRequest
) => {
  return httpClient.post<MealPlanItemResponse>("/mealplanitem/add", request);
};
