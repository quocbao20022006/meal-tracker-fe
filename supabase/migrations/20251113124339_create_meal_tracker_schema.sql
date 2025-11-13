/*
  # Meal Tracker Application Schema

  ## Overview
  This migration creates the complete database schema for a meal tracking application
  with user profiles, meals, meal plans, and nutrition tracking.

  ## New Tables
  
  ### 1. `user_profiles`
  Stores user health information and preferences
  - `id` (uuid, primary key) - References auth.users
  - `height` (decimal) - User height in cm
  - `weight` (decimal) - User weight in kg
  - `age` (integer) - User age
  - `gender` (text) - User gender (male/female/other)
  - `bmi` (decimal) - Calculated BMI
  - `bmi_category` (text) - BMI category (Underweight/Normal/Overweight/Obese)
  - `daily_calorie_goal` (integer) - Target daily calories
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `meals`
  Stores meal/recipe information
  - `id` (uuid, primary key) - Unique meal identifier
  - `name` (text) - Meal name
  - `description` (text) - Meal description
  - `image_url` (text) - URL to meal image
  - `meal_type` (text) - Type (breakfast/lunch/dinner/snack)
  - `calories` (integer) - Total calories
  - `protein` (decimal) - Protein in grams
  - `carbs` (decimal) - Carbohydrates in grams
  - `fats` (decimal) - Fats in grams
  - `prep_time` (integer) - Preparation time in minutes
  - `cook_time` (integer) - Cooking time in minutes
  - `servings` (integer) - Number of servings
  - `ingredients` (jsonb) - Array of ingredients with quantities
  - `recipe_steps` (jsonb) - Array of cooking steps
  - `created_by` (uuid) - User who created (null for system meals)
  - `is_public` (boolean) - Whether meal is publicly visible
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `meal_plans`
  Stores user meal planning entries
  - `id` (uuid, primary key) - Unique plan entry identifier
  - `user_id` (uuid) - Reference to auth.users
  - `meal_id` (uuid) - Reference to meals table
  - `date` (date) - Date of planned meal
  - `meal_type` (text) - Type (breakfast/lunch/dinner/snack)
  - `servings` (decimal) - Number of servings consumed
  - `completed` (boolean) - Whether meal was consumed
  - `notes` (text) - User notes about the meal
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `meal_history`
  Stores historical meal consumption data for analytics
  - `id` (uuid, primary key) - Unique history entry identifier
  - `user_id` (uuid) - Reference to auth.users
  - `meal_id` (uuid) - Reference to meals table
  - `date` (date) - Date meal was consumed
  - `meal_type` (text) - Type (breakfast/lunch/dinner/snack)
  - `servings` (decimal) - Number of servings consumed
  - `calories` (integer) - Actual calories consumed
  - `protein` (decimal) - Actual protein consumed
  - `carbs` (decimal) - Actual carbs consumed
  - `fats` (decimal) - Actual fats consumed
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own profile data
  - Users can view public meals and their own custom meals
  - Users can only manage their own meal plans and history
  - Policies restrict access based on user_id matching auth.uid()

  ## Notes
  - BMI is calculated as: weight(kg) / (height(m))^2
  - All nutrition values are per serving
  - JSONB fields allow flexible storage of ingredients and recipe steps
  - Indexes added for common query patterns
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  height decimal(5,2) NOT NULL,
  weight decimal(5,2) NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  bmi decimal(5,2) NOT NULL,
  bmi_category text NOT NULL CHECK (bmi_category IN ('Underweight', 'Normal', 'Overweight', 'Obese')),
  daily_calorie_goal integer DEFAULT 2000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories integer NOT NULL,
  protein decimal(6,2) NOT NULL DEFAULT 0,
  carbs decimal(6,2) NOT NULL DEFAULT 0,
  fats decimal(6,2) NOT NULL DEFAULT 0,
  prep_time integer DEFAULT 0,
  cook_time integer DEFAULT 0,
  servings integer DEFAULT 1,
  ingredients jsonb DEFAULT '[]'::jsonb,
  recipe_steps jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings decimal(4,2) DEFAULT 1,
  completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal_history table
CREATE TABLE IF NOT EXISTS meal_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings decimal(4,2) NOT NULL,
  calories integer NOT NULL,
  protein decimal(6,2) NOT NULL,
  carbs decimal(6,2) NOT NULL,
  fats decimal(6,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_is_public ON meals(is_public);
CREATE INDEX IF NOT EXISTS idx_meals_created_by ON meals(created_by);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_meal_type ON meal_plans(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_history_user_date ON meal_history(user_id, date);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for meals
CREATE POLICY "Anyone can view public meals"
  ON meals FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for meal_plans
CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for meal_history
CREATE POLICY "Users can view own meal history"
  ON meal_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meal history"
  ON meal_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own meal history"
  ON meal_history FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());