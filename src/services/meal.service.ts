import * as httpClient from '../lib/http-client';
import { Meal } from '../types';

export const getAllMeals = async () => {
  return httpClient.get<Meal[]>('/meals');
};

export const getMealById = async (id: number) => {
  return httpClient.get<Meal>(`/meals/${id}`);
};

export const searchMeals = async (query: string) => {
  return httpClient.get<Meal[]>(`/meals?search=${query}`);
};

export const getMealsByType = async (type: string) => {
  return httpClient.get<Meal[]>(`/meals?type=${type}`);
};

export const createMeal = async (meal: Omit<Meal, 'id'>) => {
  return httpClient.post<Meal>('/meals', meal);
};

export const updateMeal = async (id: number, meal: Partial<Meal>) => {
  return httpClient.put<Meal>(`/meals/${id}`, meal);
};

export const deleteMeal = async (id: number) => {
  return httpClient.httpDelete(`/meals/${id}`);
};
