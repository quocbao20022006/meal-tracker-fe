import { useCallback } from 'react';
import * as mealPlanService from '../services/meal-plan.service';
import { useFetch, useMutation } from './useFetch';
import { MealPlan, CreateMealPlanRequest } from '../types';

/**
 * Hook để quản lý Meal Plans
 */
export function useMealPlans() {
  const { data: mealPlans, loading, error, execute: fetchMealPlans } = useFetch<MealPlan[]>(
    () => mealPlanService.getAllMealPlans()
  );

  const createMealPlan = useMutation<MealPlan>(async (request: CreateMealPlanRequest) => {
    return mealPlanService.createMealPlan(request);
  });

  const updateMealPlan = useMutation<MealPlan>(async ({ id, request }) => {
    return mealPlanService.updateMealPlan(id, request);
  });

  const deleteMealPlan = useMutation(async (id: number) => {
    return mealPlanService.deleteMealPlan(id);
  });

  const getMealPlansByDate = useCallback(async (date: string) => {
    return mealPlanService.getMealPlansByDate(date);
  }, []);

  const getWeekMealPlans = useCallback(async (startDate: string) => {
    return mealPlanService.getWeekMealPlans(startDate);
  }, []);

  // const completeMealPlan = useCallback(async (id: number) => {
  //   return mealPlanService.completeMealPlan(id);
  // }, []);

  return {
    mealPlans,
    loading,
    error,
    fetchMealPlans,
    
    createMealPlan: createMealPlan.mutate,
    createMealPlanLoading: createMealPlan.loading,  
    
    updateMealPlan: updateMealPlan.mutate,
    updateMealPlanLoading: updateMealPlan.loading,
    
    deleteMealPlan: deleteMealPlan.mutate,
    deleteMealPlanLoading: deleteMealPlan.loading,
    
    getMealPlansByDate,
    getWeekMealPlans,
      // completeMealPlan,
  };
}
