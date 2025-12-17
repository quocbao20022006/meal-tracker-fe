import * as httpClient from "../lib/http-client";
import * as mealPlanItemService from "./meal-plan-item.service";
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

export const toggleMealPlanActive = async (
  id: number,
  currentPlan: MealPlanResponse
) => {
  const updatedRequest: UpdateMealPlanRequest = {
    name: currentPlan.name,
    targetCalories: currentPlan.targetCalories,
    startDate: currentPlan.startDate,
    endDate: currentPlan.endDate,
    note: currentPlan.note,
    isActive: !currentPlan.isActive,
    planType: currentPlan.planType,
  };
  return updateMealPlan(id, updatedRequest);
};

export const getMealPlanItems = async (mealPlanId: number) => {
  console.log('🔍 Getting meal plan items for mealPlanId:', mealPlanId);
  const result = await mealPlanItemService.getMealPlanItemsByDate({ mealPlanId });
  console.log('📋 Meal plan items result:', result);
  return result;
};

export const getActiveMealPlanWithMeals = async (params: MealPlanRequest) => {
  try {
    console.log('📌 Starting getActiveMealPlanWithMeals for userId:', params.userId);
    const result = await getAllMealPlans(params);
    console.log('📌 All plans result:', result);
    
    if (result?.data?.content && Array.isArray(result.data.content)) {
      const activePlan = result.data.content.find((plan: MealPlanResponse) => plan.isActive);
      console.log('📌 Active plan:', activePlan);
      
      if (activePlan) {
        // Get meals in the active plan
        console.log('📌 Fetching meals for plan id:', activePlan.id);
        const mealsResult = await getMealPlanItems(activePlan.id);
        console.log('📌 Meals result:', mealsResult);
        
        const meals = mealsResult?.data?.content || [];
        console.log('📌 Parsed meals:', meals);
        
        return { 
          data: {
            plan: activePlan,
            meals
          }, 
          error: null 
        };
      }
    }
    console.log('⚠️ No active plan found');
    return { data: null, error: null };
  } catch (error) {
    console.error('❌ Error in getActiveMealPlanWithMeals:', error);
    return { data: null, error };
  }
};
