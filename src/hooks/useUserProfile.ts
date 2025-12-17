import { useCallback, useEffect } from 'react';
import * as userProfileService from '../services/user-profile.service';
import { useFetch, useMutation } from './useFetch';
import { UserProfile, CreateUserProfileRequest, UpdateUserProfileRequest } from '../types';

/**
 * Hook để quản lý User Profile
 */
export function useUserProfile(userId: number) {
  const { data: profile, loading, error, execute: fetchProfile, setData } = useFetch<UserProfile>(
    () => userProfileService.getProfile(userId)
  );

  // Auto-fetch profile when userId changes
  useEffect(() => {
    if (userId && userId > 0) {
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  const createProfile = useMutation<UserProfile>(async (request: CreateUserProfileRequest) => {
    const result = await userProfileService.createProfile(request);

    // Update local state if successful
    if (result.data) {
      setData(result.data);
    }

    return result;
  });

  const updateProfile = useMutation<UserProfile>(async (request: UpdateUserProfileRequest) => {
    const result = await userProfileService.updateProfile(userId, request);

    // Update local state if successful
    if (result.data) {
      setData(result.data);
    }

    return result;
  });

  const calculateBMI = useCallback((weight: number, height: number) => {
    return userProfileService.calculateBMI(weight, height);
  }, []);

  const getBMICategory = useCallback((bmi: number) => {
    return userProfileService.getBMICategory(bmi);
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,

    createProfile: createProfile.mutate,
    createProfileLoading: createProfile.loading,
    createProfileError: createProfile.error,

    updateProfile: updateProfile.mutate,
    updateProfileLoading: updateProfile.loading,
    updateProfileError: updateProfile.error,

    calculateBMI,
    getBMICategory,
  };
}