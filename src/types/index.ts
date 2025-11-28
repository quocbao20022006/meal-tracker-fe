// Types cho các request/response từ API
export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  bmi: number;
  bmiCategory: string;
  dailyCalorieGoal: number;
  updatedAt: string;
}

export interface CreateUserProfileRequest {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  dailyCalorieGoal: number;
}

export interface UpdateUserProfileRequest {
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
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

export interface MealPlan {
  id: number;
  userId: number;
  mealId: number;
  date: string;
  mealType: string;
  servings: number;
  completed: boolean;
  meal?: Meal;
}

export interface CreateMealPlanRequest {
  mealId: number;
  date: string;
  mealType: string;
  servings: number;
}

export interface UpdateMealPlanRequest {
  servings?: number;
  completed?: boolean;
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
