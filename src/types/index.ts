// Types cho các request/response từ API
export interface AuthResponse {
  access_token: string;
  user_id: number;
  status: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface OtpResponse {
  message: string;
  status: string;
}

export interface PasswordResetResponse {
  message: string;
  status: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  height: number;
  weight: number;
  age: number;
  gender: "male" | "female" | "other";
  bmi: number;
  bmiCategory: string;
  dailyCalorieGoal: number;
  updatedAt: string;
}

export interface CreateUserProfileRequest {
  height: number;
  weight: number;
  age: number;
  gender: "male" | "female" | "other";
  dailyCalorieGoal: number;
}

export interface UpdateUserProfileRequest {
  height?: number;
  weight?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  dailyCalorieGoal?: number;
}

export interface MealResponse {
  id: number;
  meal_name: string;
  meal_description: string | null;
  image_url: string | null;
  meal_ingredients: {
    ingredient_name: string;
    quantity: number;
  }[];
  meal_instructions: {
    step: number;
    instruction: string;
  }[];
  cooking_time: string;
  calories: number;
  servings: number;
  nutrition: string[];
  category_name: string[];
}

export interface PaginatedMeals {
  content: MealResponse[];
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;
}

export interface MealPlan {
  id: number;
  userId: number;
  mealId: number;
  date: string;
  mealType: string;
  servings: number;
  completed: boolean;
  meal?: MealResponse;
}

export interface CreateMealPlanRequest {
  name: string;
  userId: number;
  targetCalories?: number;
  startDate: string;
  endDate: string;
  note?: string;
  planType: PlanType;
  isActive: boolean;
}

export interface UpdateMealPlanRequest {
  name: string;
  targetCalories?: number;
  startDate: string;
  endDate: string;
  note?: string;
  isActive: boolean;
  planType: PlanType;
}

// Meal Plan
export enum PlanType {
  WEEKLY,
  MONTHLY,
}

export interface MealPlanRequest {
  userId?: number;
}

export interface MealPlanResponse {
  id: number;
  userId: number;
  name: string;
  note?: string;
  targetCalories?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  planType: PlanType;
}

export interface PaginatedMealPlans {
  content: MealPlanResponse[];
}

export interface UpdateMealPlanTemplateRequest {
  name?: string;
  description?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  loading?: boolean;
}
