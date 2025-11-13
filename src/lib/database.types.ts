export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          height: number
          weight: number
          age: number
          gender: 'male' | 'female' | 'other'
          bmi: number
          bmi_category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese'
          daily_calorie_goal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          height: number
          weight: number
          age: number
          gender: 'male' | 'female' | 'other'
          bmi: number
          bmi_category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese'
          daily_calorie_goal?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          height?: number
          weight?: number
          age?: number
          gender?: 'male' | 'female' | 'other'
          bmi?: number
          bmi_category?: 'Underweight' | 'Normal' | 'Overweight' | 'Obese'
          daily_calorie_goal?: number
          created_at?: string
          updated_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          calories: number
          protein: number
          carbs: number
          fats: number
          prep_time: number
          cook_time: number
          servings: number
          ingredients: Json
          recipe_steps: Json
          created_by: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          calories: number
          protein?: number
          carbs?: number
          fats?: number
          prep_time?: number
          cook_time?: number
          servings?: number
          ingredients?: Json
          recipe_steps?: Json
          created_by?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          calories?: number
          protein?: number
          carbs?: number
          fats?: number
          prep_time?: number
          cook_time?: number
          servings?: number
          ingredients?: Json
          recipe_steps?: Json
          created_by?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          meal_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings: number
          completed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings?: number
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_id?: string
          date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings?: number
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meal_history: {
        Row: {
          id: string
          user_id: string
          meal_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings: number
          calories: number
          protein: number
          carbs: number
          fats: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings: number
          calories: number
          protein: number
          carbs: number
          fats: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_id?: string
          date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          servings?: number
          calories?: number
          protein?: number
          carbs?: number
          fats?: number
          created_at?: string
        }
      }
    }
  }
}
