import { useCallback } from 'react';
import * as mealService from '../services/meal.service';
import { useFetch, useMutation } from './useFetch';
import { Meal } from '../types';

/**
 * Hook để quản lý Meals
 */
export function useMeals() {
  const { data: meals, loading, error, execute: fetchMeals } = useFetch<Meal[]>(
    () => mealService.getAllMeals()
  );

  const createMeal = useMutation<Meal>(async (meal) => {
    return mealService.createMeal(meal);
  });

  const updateMeal = useMutation<Meal>(async ({ id, meal }) => {
    return mealService.updateMeal(id, meal);
  });

  const deleteMeal = useMutation(async (id: number) => {
    return mealService.deleteMeal(id);
  });

  const searchMeals = useCallback(async (query: string) => {
    return mealService.searchMeals(query);
  }, []);

  const getMealsByType = useCallback(async (type: string) => {
    return mealService.getMealsByType(type);
  }, []);

  return {
    meals,
    loading,
    error,
    fetchMeals,
    
    createMeal: createMeal.mutate,
    createMealLoading: createMeal.loading,
    
    updateMeal: updateMeal.mutate,
    updateMealLoading: updateMeal.loading,
    
    deleteMeal: deleteMeal.mutate,
    deleteMealLoading: deleteMeal.loading,
    
    searchMeals,
    getMealsByType,
  };
}
