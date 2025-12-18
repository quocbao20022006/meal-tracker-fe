import * as httpClient from "../lib/http-client";
import {
  CreateMealPlanItemRequest,
  MealPlanItemRequest,
  MealPlanItemResponse,
  PaginatedMealPlanItems,
  ActivePlanResponse,
} from "../types";

export const getMealPlanItemsByDate = async (params: MealPlanItemRequest) => {
  return httpClient.get<PaginatedMealPlanItems>(
    `/meal-plan-item/all?${
      params.mealPlanId ? `mealPlanId=${params.mealPlanId}` : ""
    }${params.date ? `&date=${params.date}` : ""}`
  );
};

export const createMealPlanItem = async (
  request: CreateMealPlanItemRequest
) => {
  return httpClient.post<MealPlanItemResponse>("/meal-plan-item/add", request);
};

export const deleteMealPlanItem = async (id: number) => {
  return httpClient.httpDelete(`/meal-plan-item/delete/${id}`);
};

export const getActivePlan = async (userId: number) => {
  return httpClient.get<ActivePlanResponse>(
    `/meal-plan-item/active-plan/${userId}`
  );
}
