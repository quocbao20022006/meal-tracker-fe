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
  name: string;
  description: string | null;
  imageUrl: string | null;
  mealIngredients: {
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    description?: string;
    unit?: string;
  }[];
  mealInstructions: {
    step: number;
    instruction: string;
  }[];
  cookingTime: string;
  calories: number;
  servings: number;
  nutrition: string[];
  categoryName: string[];
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
  mealId: number;
  date: string;
  mealType: string;
  servings: number;
}

export interface UpdateMealRequest {
  mealName: string;
  mealDescription?: string | null;
  image?: File | null; // image file, tương ứng với MultipartFile
  mealIngredients: {
    ingredientId: number;
    quantity: number;
    unit?: string;
  }[];
  mealInstructions: {
    step: number;
    instruction: string;
  }[];
  cookingTime: string;
  servings: number;
  nutrition?: string[];
  categoryName?: string[];
}

export interface MealPlanTemplate {
  id: number;
  userId: number;
  name: string;
  description?: string;
  goal?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealPlanTemplateRequest {
  name: string;
  description?: string;
  goal?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
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

export interface IngredientResponse {
  id: number;
  name: string;
  calories: number;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaginatedIngredients {
  content: IngredientResponse[];
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;
}
