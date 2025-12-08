import { useEffect, useState } from 'react';
import { User, Scale, TrendingUp, Target, Save, Activity, AlertCircle, Edit, X, Calendar } from 'lucide-react';
import Header from '../components/Header';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuthContext } from '../contexts/AuthContext';
import { ACTIVITY_LEVELS, GOAL_OPTIONS, ActivityLevel, GoalType } from '../types';
import { validateWeightGoal, getBMICategoryColor } from '../utils/bmiHelper';
import { calculateAge } from '../services/user-profile.service';

export default function Profile() {
  const { user } = useAuthContext();
  const { profile, loading, updateProfile } = useUserProfile(user?.id || 0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weightGoalWarning, setWeightGoalWarning] = useState('');

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    weightGoal: '',
    birthDate: '', // Changed from age to birthDate
    gender: 'male' as 'male' | 'female' | 'other',
    activityLevel: 'moderate' as ActivityLevel,
    goal: 'maintain' as GoalType,
  });

  // Load profile data into form when profile is fetched
  useEffect(() => {
    if (profile) {
      setFormData({
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        weightGoal: profile.weightGoal?.toString() || '',
        birthDate: profile.birthDate || '', // Use birthDate from profile
        gender: profile.gender || 'male',
        activityLevel: (profile.activityLevel as ActivityLevel) || 'moderate',
        goal: (profile.goal as GoalType) || 'maintain',
      });
    }
  }, [profile]);

  const handleWeightGoalChange = (value: string) => {
    setFormData({ ...formData, weightGoal: value });

    if (value && formData.height) {
      const validation = validateWeightGoal(parseFloat(formData.height), parseFloat(value));
      setWeightGoalWarning(validation.message);
    } else {
      setWeightGoalWarning('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const weightGoal = formData.weightGoal ? parseFloat(formData.weightGoal) : undefined;

    await updateProfile({
      height,
      weight,
      weightGoal,
      birthDate: formData.birthDate,
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
    });

    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    // Reset form to current profile data
    if (profile) {
      setFormData({
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        weightGoal: profile.weightGoal?.toString() || '',
        birthDate: profile.birthDate || '',
        gender: profile.gender || 'male',
        activityLevel: (profile.activityLevel as ActivityLevel) || 'moderate',
        goal: (profile.goal as GoalType) || 'maintain',
      });
    }
    setWeightGoalWarning('');
    setEditing(false);
  };

  // Calculate age for display
  const displayAge = formData.birthDate ? calculateAge(formData.birthDate) : profile?.age || null;

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
            {/* User Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {user?.email}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Member since {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mb-6">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Content */}
            {!editing ? (
              // VIEW MODE
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Height</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile?.height || 'N/A'} cm
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Weight</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile?.weight || 'N/A'} kg
                  </p>
                </div>

                {profile?.weightGoal && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Target Weight</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profile.weightGoal} kg
                    </p>
                    {profile.weightDifference !== undefined && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {Math.abs(profile.weightDifference).toFixed(1)} kg to go
                        {profile.goalAchieved && (
                          <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓ Goal achieved!</span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Birth Date</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'N/A'}
                  </p>
                  {profile?.age && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {profile.age} years old
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gender</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                    {profile?.gender || 'N/A'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Activity Level</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {ACTIVITY_LEVELS[profile?.activityLevel as ActivityLevel] || 'Moderate'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-pink-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Goal</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {GOAL_OPTIONS[profile?.goal as GoalType] || 'Maintain Weight'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">BMI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profile?.bmi?.toFixed(1) || 'N/A'}
                    </p>
                    {profile?.bmiCategory && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBMICategoryColor(profile.bmiCategory)}`}>
                        {profile.bmiCategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Calorie Goal</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile?.dailyCalorieGoal || 'N/A'} cal
                  </p>
                </div>
              </div>
            ) : (
              // EDIT MODE
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
                    min="100"
                    max="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    min="30"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Weight (kg) - Optional
                  </label>
                  <input
                    type="number"
                    value={formData.weightGoal}
                    onChange={(e) => handleWeightGoalChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    min="30"
                    max="300"
                  />
                  {weightGoalWarning && (
                    <div className={`mt-2 p-2 rounded-lg flex items-start gap-2 ${weightGoalWarning.includes('✅')
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'bg-orange-50 dark:bg-orange-900/20'
                      }`}>
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${weightGoalWarning.includes('✅')
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-orange-600 dark:text-orange-400'
                        }`} />
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {weightGoalWarning}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                  {displayAge !== null && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Age: {displayAge} years old
                    </p>
                  )}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    {Object.entries(ACTIVITY_LEVELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as GoalType })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    {Object.entries(GOAL_OPTIONS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}