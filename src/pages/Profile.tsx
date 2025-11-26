import { useEffect, useState } from 'react';
import { User, Scale, TrendingUp, Target, Save } from 'lucide-react';
import Header from '../components/Header';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserProfile } from '../types';

// Sample user data for demo
const SAMPLE_PROFILE: UserProfile = {
  id: 1,
  userId: 1,
  height: 175,
  weight: 70,
  age: 28,
  gender: 'male',
  bmi: 22.86,
  bmiCategory: 'Normal',
  dailyCalorieGoal: 2500,
  updatedAt: new Date().toISOString()
};

const SAMPLE_USER_EMAIL = 'demo@example.com';
const SAMPLE_USER_CREATED = '2024-01-15';

export default function Profile() {
  const { profile: profileFromHook, loading, updateProfile } = useUserProfile(1);
  // Use sample profile if hook profile is not available
  const profile = profileFromHook || SAMPLE_PROFILE;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dailyCalorieGoal: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        height: profile.height.toString(),
        weight: profile.weight.toString(),
        age: profile.age.toString(),
        gender: profile.gender,
        dailyCalorieGoal: profile.dailyCalorieGoal.toString()
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    const dailyCalorieGoal = parseInt(formData.dailyCalorieGoal);

    // Use the update hook
    await updateProfile({
      height,
      weight,
      age,
      gender: formData.gender,
      dailyCalorieGoal
    });

    setSaving(false);
    setEditing(false);
  };

  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Normal': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Overweight': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Obese': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Profile" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {SAMPLE_USER_EMAIL}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Member since {new Date(SAMPLE_USER_CREATED).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      if (profile) {
                        setFormData({
                          height: profile.height.toString(),
                          weight: profile.weight.toString(),
                          age: profile.age.toString(),
                          gender: profile.gender as 'male' | 'female' | 'other',
                          dailyCalorieGoal: profile.dailyCalorieGoal.toString()
                        });
                      }
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {!editing && profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Height</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.height} cm
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weight</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.weight} kg
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Age</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.age} years
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gender</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                    {profile.gender}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">BMI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profile.bmi.toFixed(1)}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBMICategoryColor(profile.bmiCategory)}`}>
                      {profile.bmiCategory}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Goal</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.dailyCalorieGoal} cal
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Calorie Goal
                  </label>
                  <input
                    type="number"
                    value={formData.dailyCalorieGoal}
                    onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
