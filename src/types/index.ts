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
  image_url: File | null;
  meal_ingredients: {
    id: number;
    ingredient_name: string;
    quantity: number;
    calories: number;
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
  mealId: number;
  date: string;
  mealType: string;
  servings: number;
}

export interface UpdateMealRequest {
  meal_name: string;
  meal_description?: string | null;
  image?: File | null; // image file, tương ứng với MultipartFile
  meal_ingredients: {
    ingredient_id: number;
    quantity: number;
  }[];
  meal_instructions: {
    step: number;
    instruction: string;
  }[];
  cooking_time: string;
  servings: number;
  nutrition?: string[];
  category_name?: string[];
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
