import { useCallback } from 'react';
import * as userProfileService from '../services/user-profile.service';
import { useFetch, useMutation } from './useFetch';
import { UserProfile, CreateUserProfileRequest, UpdateUserProfileRequest } from '../types';

/**
 * Hook để quản lý User Profile
 */
export function useUserProfile(userId: number) {
  const { data: profile, loading, error, execute: fetchProfile } = useFetch<UserProfile>(
    () => userProfileService.getProfile(userId)
  );

  const createProfile = useMutation<UserProfile>(async (request: CreateUserProfileRequest) => {
    return userProfileService.createProfile(request);
  });

  const updateProfile = useMutation<UserProfile>(async (request: UpdateUserProfileRequest) => {
    return userProfileService.updateProfile(userId, request);
  });

  const calculateBMI = useCallback((weight: number, height: number) => {
    return userProfileService.calculateBMI(weight, height);
  }, []);

  const getBMICategory = useCallback((bmi: number) => {
    return userProfileService.getBMICategory(bmi);
  }, []);

  const calculateDailyCalories = useCallback(
    (weight: number, height: number, age: number, gender: string) => {
      return userProfileService.calculateDailyCalories(weight, height, age, gender);
    },
    []
  );

  return {
    profile,
    loading,
    error,
    fetchProfile,
    
    createProfile: createProfile.mutate,
    createProfileLoading: createProfile.loading,
    
    updateProfile: updateProfile.mutate,
    updateProfileLoading: updateProfile.loading,
    
    calculateBMI,
    getBMICategory,
    calculateDailyCalories,
  };
}
