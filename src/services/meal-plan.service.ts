import * as httpClient from "../lib/http-client";
import {
  MealPlan,
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
  PaginatedMealPlans,
  MealPlanRequest,
  MealPlanResponse,
} from "../types";

export const getAllMealPlans = async (params: MealPlanRequest) => {
  return httpClient.get<PaginatedMealPlans>(
    `/meal-plan/all?userId=${params.userId}&sort=createdAt,desc`
  );
};

export const getMealPlanById = async (id: number) => {
  return httpClient.get<MealPlanResponse>(`/meal-plan/detail/${id}`);
};

export const getMealPlansByDate = async (date: string) => {
  return httpClient.get<MealPlanResponse[]>(`/meal-plans?date=${date}`);
};

export const getMealPlansByDateRange = async (
  startDate: string,
  endDate: string
) => {
  return httpClient.get<MealPlan[]>(
    `/meal-plans?startDate=${startDate}&endDate=${endDate}`
  );
};

export const createMealPlan = async (request: CreateMealPlanRequest) => {
  return httpClient.post<MealPlanResponse>("/meal-plan/add", request);
};

export const updateMealPlan = async (
  id: number,
  request: UpdateMealPlanRequest
) => {
  return httpClient.put<MealPlan>(`/meal-plan/update/${id}`, request);
};

export const deleteMealPlan = async (id: number) => {
  return httpClient.httpDelete(`/meal-plan/delete/${id}`);
};

// export const completeMealPlan = async (id: number) => {
//   return updateMealPlan(id, { completed: true });
// };

export const getWeekMealPlans = async (startDate: string) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return getMealPlansByDateRange(
    startDate,
    endDate.toISOString().split("T")[0]
  );
};

export const getMonthMealPlans = async (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return getMealPlansByDateRange(
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0]
  );
};
