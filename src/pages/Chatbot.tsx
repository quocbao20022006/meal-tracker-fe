import { useEffect, useState } from 'react';
import Chatbot from '../components/Chatbot';
import { useAuthContext } from '../contexts/AuthContext';
import { UserProfile } from '../types';
import { getProfile } from '@/services/user-profile.service';

export default function ChatbotWidget() {
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();

  useEffect(() => {
    if (!user) return;

    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const result = await getProfile(user.id);
        if (result && result.data) {
          setUserProfile(result.data as UserProfile);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Only render if user is authenticated
  if (!user) return null;

  return <Chatbot userProfile={userProfile} />;
}
