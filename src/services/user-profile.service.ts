import * as httpClient from '../lib/http-client';
import {
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
} from '../types';

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Get user profile by userId
 * API: GET /api/user-management/{userId}
 */
export const getProfile = async (userId: number) => {
  return httpClient.get<UserProfile>(`/user-management/${userId}`);
};

/**
 * Create new user profile
 * API: PUT /api/user-management/update/{userId}
 */
export const createProfile = async (request: CreateUserProfileRequest) => {
  // Get userId from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('User not found in localStorage');
  }

  const userId = JSON.parse(userStr).id;

  console.log('Creating profile for userId:', userId);
  console.log('Request data:', request);

  // Map frontend field names to backend field names
  const payload = {
    full_name: null, // Keep existing
    gender: request.gender,
    birth_date: request.birthDate, // Send birth_date instead of age
    height: request.height,
    weight: request.weight,
    weight_goal: request.weightGoal || null,
    activity_level: request.activityLevel,
    goal: request.goal
  };

  console.log('Payload to backend:', payload);

  const result = await httpClient.put<UserProfile>(
    `/user-management/update/${userId}`,
    payload
  );

  console.log('Backend response:', result);

  return result;
};

/**
 * Update user profile
 * API: PUT /api/user-management/update/{userId}
 */
export const updateProfile = async (userId: number, request: UpdateUserProfileRequest) => {
  console.log('Updating profile for userId:', userId);
  console.log('Request data:', request);

  // Map frontend field names to backend field names
  const payload: any = {};

  if (request.height !== undefined) payload.height = request.height;
  if (request.weight !== undefined) payload.weight = request.weight;
  if (request.weightGoal !== undefined) payload.weight_goal = request.weightGoal;
  if (request.birthDate !== undefined) payload.birth_date = request.birthDate; // Send birth_date
  if (request.gender !== undefined) payload.gender = request.gender;
  if (request.activityLevel !== undefined) payload.activity_level = request.activityLevel;
  if (request.goal !== undefined) payload.goal = request.goal;

  console.log('Payload to backend:', payload);

  const result = await httpClient.put<UserProfile>(
    `/user-management/update/${userId}`,
    payload
  );

  console.log('Backend response:', result);

  return result;
};

/**
 * Calculate BMI from weight and height
 */
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Calculate daily calories using Harris-Benedict equation
 */
export const calculateDailyCalories = (
  weight: number,
  height: number,
  birthDate: string,
  gender: string,
  activityLevel: string = 'moderate',
  goal: string = 'maintain'
): number => {
  const age = calculateAge(birthDate);

  let bmr: number;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  // Adjust for goal
  let dailyCalories = tdee;
  if (goal === 'lose_weight') {
    dailyCalories = tdee - 500; // Deficit 500 cal/day ≈ 0.5kg/week
  } else if (goal === 'gain_weight') {
    dailyCalories = tdee + 500; // Surplus 500 cal/day ≈ 0.5kg/week
  }

  return Math.round(dailyCalories);
};