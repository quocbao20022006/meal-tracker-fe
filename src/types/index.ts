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

export interface Meal {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime: number;
  cookTime: number;
  servings: number;
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
