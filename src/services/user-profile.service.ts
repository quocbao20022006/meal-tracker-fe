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
 * Map backend UserResponse to frontend UserProfile
 */
const mapUserResponseToProfile = (data: any): UserProfile => {
  return {
    id: data.user_id,
    username: data.username,
    email: data.email,
    fullName: data.full_name,
    gender: data.gender,
    birthDate: data.birth_date,
    age: data.age,
    height: data.height,
    weight: data.weight,
    weightGoal: data.weight_goal,
    weightDifference: data.weight_difference,
    goalAchieved: data.goal_achieved,
    bmi: data.bmi,
    bmiClassification: data.bmi_classification,
    dailyCalories: data.daily_calories,
    activityLevel: data.activity_level,
    goal: data.goal,
    createdAt: data.created_at,
    //Quick fix
    userId: 0,
    bmiCategory: '',
    dailyCalorieGoal: 0,
    updatedAt: '',
  };
};

/**
 * Get user profile by userId
 * API: GET /api/user-management/{userId}
 */
export const getProfile = async (userId: number) => {
  const result = await httpClient.get<any>(`/user-management/${userId}`);

  if (result.data) {
    return {
      ...result,
      data: mapUserResponseToProfile(result.data),
    };
  }

  return result as { data: UserProfile | null; error: any };
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
    birth_date: request.birthDate,
    height: request.height,
    weight: request.weight,
    weight_goal: request.weightGoal || null,
    activity_level: request.activityLevel,
    goal: request.goal
  };

  console.log('Payload to backend:', payload);

  const result = await httpClient.put<any>(
    `/user-management/update/${userId}`,
    payload
  );

  console.log('Backend response:', result);

  if (result.data) {
    return {
      ...result,
      data: mapUserResponseToProfile(result.data),
    };
  }

  return result as { data: UserProfile | null; error: any };
};

/**
 * Update user profile
 * API: PUT /api/user-management/update/${userId}
 */
export const updateProfile = async (userId: number, request: UpdateUserProfileRequest) => {
  console.log('Updating profile for userId:', userId);
  console.log('Request data:', request);

  // Map frontend field names to backend field names
  const payload: any = {};

  if (request.height !== undefined) payload.height = request.height;
  if (request.weight !== undefined) payload.weight = request.weight;
  if (request.weightGoal !== undefined) payload.weight_goal = request.weightGoal;
  if (request.birthDate !== undefined) payload.birth_date = request.birthDate;
  if (request.gender !== undefined) payload.gender = request.gender;
  if (request.activityLevel !== undefined) payload.activity_level = request.activityLevel;
  if (request.goal !== undefined) payload.goal = request.goal;

  console.log('Payload to backend:', payload);

  const result = await httpClient.put<any>(
    `/user-management/update/${userId}`,
    payload
  );

  console.log('Backend response:', result);

  if (result.data) {
    return {
      ...result,
      data: mapUserResponseToProfile(result.data),
    };
  }

  return result as { data: UserProfile | null; error: any };
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