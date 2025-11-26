import * as httpClient from '../lib/http-client';
import {
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
} from '../types';

export const getProfile = async (userId: number) => {
  return httpClient.get<UserProfile>(`/user-profiles/${userId}`);
};

export const createProfile = async (request: CreateUserProfileRequest) => {
  return httpClient.post<UserProfile>('/user-profiles', request);
};

export const updateProfile = async (userId: number, request: UpdateUserProfileRequest) => {
  return httpClient.put<UserProfile>(
    `/user-profiles/${userId}`,
    request
  );
};

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateDailyCalories = (
  weight: number,
  height: number,
  age: number,
  gender: string
): number => {
  let bmr: number;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
  return Math.round(bmr * 1.375);
};
