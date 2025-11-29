import * as httpClient from '../lib/http-client';
import { MealResponse, PaginatedMeals } from '../types';

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

export const updateMeal = async (id: number, meal: Partial<MealResponse>) => {
  return httpClient.put<MealResponse>(`/meals/${id}`, meal);
};

export const deleteMeal = async (id: number) => {
  return httpClient.httpDelete(`/meals/${id}`);
};
