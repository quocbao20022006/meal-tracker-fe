import { useEffect, useState } from 'react';
import { User, Scale, TrendingUp, Target, Save, Calendar, Activity, Award } from 'lucide-react';
import WeightUpdateModal from '../components/WeightUpdateModal';

// Mock Header component
function Header({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    height: '',
    weight: '',
    weightGoal: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female' | 'other',
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id;

      // Fetch profile from API
      const response = await fetch(`http://localhost:8080/api/user-management/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);

      // Set form data
      setFormData({
        fullName: data.full_name || '',
        height: data.height?.toString() || '',
        weight: data.weight?.toString() || '',
        weightGoal: data.weight_goal?.toString() || '',
        birthDate: data.birth_date || '',
        gender: data.gender || 'male',
        activityLevel: data.activity_level || 'moderate',
        goal: data.goal || 'maintain'
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User not found');
        setSaving(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id;

      // Prepare update payload
      const payload = {
        full_name: formData.fullName || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weight_goal: formData.weightGoal ? parseFloat(formData.weightGoal) : null,
        birth_date: formData.birthDate || null,
        gender: formData.gender,
        activity_level: formData.activityLevel,
        goal: formData.goal
      };

      const response = await fetch(`http://localhost:8080/api/user-management/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data);
      setEditing(false);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleWeightUpdateSuccess = (newWeight: number) => {
    // Reload profile to get updated data
    loadProfile();
  };

  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
      case 'Normal': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
      case 'Overweight': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30';
      case 'Obese': return 'text-red-600 bg-red-50 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  const getActivityLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: 'Sedentary',
      light: 'Light',
      moderate: 'Moderate',
      active: 'Active',
      very_active: 'Very Active'
    };
    return labels[level] || level;
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      lose_weight: 'Lose Weight',
      maintain: 'Maintain Weight',
      gain_weight: 'Gain Weight'
    };
    return labels[goal] || goal;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Profile" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {profile?.full_name || profile?.username || profile?.email}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Member since {profile?.created_at ? new Date(profile.created_at.split(' ')[0].split('/').reverse().join('-')).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mb-6">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsWeightModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
                  >
                    <Scale className="w-4 h-4" />
                    Update Weight
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setError('');
                      // Reset form data
                      if (profile) {
                        setFormData({
                          fullName: profile.full_name || '',
                          height: profile.height?.toString() || '',
                          weight: profile.weight?.toString() || '',
                          weightGoal: profile.weight_goal?.toString() || '',
                          birthDate: profile.birth_date || '',
                          gender: profile.gender || 'male',
                          activityLevel: profile.activity_level || 'moderate',
                          goal: profile.goal || 'maintain'
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
                {/* Full Name */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Full Name</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {profile.full_name || 'Not set'}
                  </p>
                </div>

                {/* Email */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {profile.email}
                  </p>
                </div>

                {/* Height */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Height</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.height ? `${profile.height} cm` : 'Not set'}
                  </p>
                </div>

                {/* Weight */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weight</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.weight ? `${profile.weight} kg` : 'Not set'}
                  </p>
                </div>

                {/* Weight Goal */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weight Goal</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.weight_goal ? `${profile.weight_goal} kg` : 'Not set'}
                  </p>
                  {profile.weight_difference && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {profile.weight_difference > 0 ? `${profile.weight_difference.toFixed(1)} kg to lose` : `${Math.abs(profile.weight_difference).toFixed(1)} kg to gain`}
                    </p>
                  )}
                </div>

                {/* Age & Birth Date */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Age</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.age ? `${profile.age} years` : 'Not set'}
                  </p>
                  {profile.birth_date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Born: {profile.birth_date}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gender</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                    {profile.gender || 'Not set'}
                  </p>
                </div>

                {/* BMI */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">BMI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profile.bmi ? profile.bmi.toFixed(1) : 'N/A'}
                    </p>
                    {profile.bmi_classification && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBMICategoryColor(profile.bmi_classification)}`}>
                        {profile.bmi_classification}
                      </span>
                    )}
                  </div>
                </div>

                {/* Daily Calories */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Goal</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {profile.daily_calories ? `${Math.round(profile.daily_calories)} cal` : 'Not set'}
                  </p>
                </div>

                {/* Activity Level */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Activity Level</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {profile.activity_level ? getActivityLevelLabel(profile.activity_level) : 'Not set'}
                  </p>
                </div>

                {/* Goal */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fitness Goal</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {profile.goal ? getGoalLabel(profile.goal) : 'Not set'}
                  </p>
                </div>

                {/* Goal Achievement Status */}
                {profile.weight_goal && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Goal Status</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {profile.goal_achieved ? (
                        <>
                          <span className="text-2xl">🎉</span>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            Goal Achieved! You're within 0.5kg of your target weight.
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">💪</span>
                          <p className="text-xl font-bold text-gray-800 dark:text-white">
                            Keep going! {Math.abs(profile.weight_difference || 0).toFixed(1)} kg to reach your goal.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="175"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="70"
                  />
                </div>

                {/* Weight Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight Goal (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weightGoal}
                    onChange={(e) => setFormData({ ...formData, weightGoal: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="65"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fitness Goal
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="lose_weight">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain_weight">Gain Weight</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weight Update Modal */}
      {profile && (
        <WeightUpdateModal
          open={isWeightModalOpen}
          onOpenChange={setIsWeightModalOpen}
          currentWeight={profile.weight || 0}
          targetWeight={profile.weight_goal}
          userId={profile.user_id}
          onUpdateSuccess={handleWeightUpdateSuccess}
        />
      )}
    </div>
  );
}