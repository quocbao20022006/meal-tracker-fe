import * as httpClient from '../lib/http-client';
import { MealResponse } from '../types';

export const getAllMeals = async () => {
  return httpClient.get<MealResponse[]>('/meals');
};

export const getMealById = async (id: number) => {
  return httpClient.get<MealResponse>(`/meals/${id}`);
};

export const searchMeals = async (query: string) => {
  return httpClient.get<MealResponse[]>(`/meals?search=${query}`);
};

export const getMealsByType = async (type: string) => {
  return httpClient.get<MealResponse[]>(`/meals?type=${type}`);
};

export const createMeal = async (meal: Omit<MealResponse, 'id'>) => {
  return httpClient.post<MealResponse>('/meals', meal);
};

export const updateMeal = async (id: number, meal: Partial<MealResponse>) => {
  return httpClient.put<MealResponse>(`/meals/${id}`, meal);
};

export const deleteMeal = async (id: number) => {
  return httpClient.httpDelete(`/meals/${id}`);
};
