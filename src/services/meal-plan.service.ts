import * as httpClient from '../lib/http-client';
import {
  MealPlan,
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
} from '../types';

export const getAllMealPlans = async () => {
  return httpClient.get<MealPlan[]>('/meal-plans');
};

export const getMealPlanById = async (id: number) => {
  return httpClient.get<MealPlan>(`/meal-plans/${id}`);
};

export const getMealPlansByDate = async (date: string) => {
  return httpClient.get<MealPlan[]>(`/meal-plans?date=${date}`);
};

export const getMealPlansByDateRange = async (startDate: string, endDate: string) => {
  return httpClient.get<MealPlan[]>(
    `/meal-plans?startDate=${startDate}&endDate=${endDate}`
  );
};

export const createMealPlan = async (request: CreateMealPlanRequest) => {
  return httpClient.post<MealPlan>('/meal-plans', request);
};

export const updateMealPlan = async (id: number, request: UpdateMealPlanRequest) => {
  return httpClient.put<MealPlan>(`/meal-plans/${id}`, request);
};

export const deleteMealPlan = async (id: number) => {
  return httpClient.httpDelete(`/meal-plans/${id}`);
};

export const completeMealPlan = async (id: number) => {
  return updateMealPlan(id, { completed: true });
};

export const getWeekMealPlans = async (startDate: string) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return getMealPlansByDateRange(
    startDate,
    endDate.toISOString().split('T')[0]
  );
};

export const getMonthMealPlans = async (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return getMealPlansByDateRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );
};
