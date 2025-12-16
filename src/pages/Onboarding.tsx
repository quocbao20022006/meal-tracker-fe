import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { User, Scale, Calendar, Users, Activity, Target, AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ACTIVITY_LEVELS, GOAL_OPTIONS, ActivityLevel, GoalType } from '../types';
import { validateWeightGoal, calculateBMI, getBMICategory } from '../utils/bmiHelper';
import { calculateAge } from '../services/user-profile.service';

export default function Onboarding() {
  const { user, refreshAuth } = useAuthContext();
  const { createProfile, createProfileLoading } = useUserProfile(user?.id || 0);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weightGoalWarning, setWeightGoalWarning] = useState('');

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    weightGoal: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female' | 'other',
    activityLevel: 'moderate' as ActivityLevel,
    goal: 'maintain' as GoalType,
  });

  const handleWeightGoalChange = (value: string) => {
    setFormData({ ...formData, weightGoal: value });

    if (value && formData.height) {
      const validation = validateWeightGoal(parseFloat(formData.height), parseFloat(value));
      setWeightGoalWarning(validation.message);
    } else {
      setWeightGoalWarning('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const weightGoal = formData.weightGoal ? parseFloat(formData.weightGoal) : undefined;

      if (!weight || !height || !formData.birthDate) {
        setError('Please fill in all required fields with valid values');
        setLoading(false);
        return;
      }

      // Validate birth date
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate >= today) {
        setError('Birth date must be in the past');
        setLoading(false);
        return;
      }

      // Check minimum age (e.g., 10 years old)
      const age = calculateAge(formData.birthDate);
      if (age < 10) {
        setError('You must be at least 10 years old');
        setLoading(false);
        return;
      }

      await createProfile({
        height,
        weight,
        weightGoal,
        birthDate: formData.birthDate,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
      });

      localStorage.setItem('hasProfile', 'true');
      refreshAuth();

      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError('');

    // Validate theo từng bước
    if (step === 1) {
      if (!formData.height || parseFloat(formData.height) <= 0) {
        setError('Please enter a valid height');
        return;
      }
    }

    if (step === 2) {
      if (!formData.weight || parseFloat(formData.weight) <= 0) {
        setError('Please enter a valid weight');
        return;
      }
    }

    // Step 3 (goal) - không cần validate, chỉ chọn
    // Step 4 (weight goal) là optional, không cần validate

    if (step === 5) {
      if (!formData.birthDate) {
        setError('Please enter your birth date');
        return;
      }

      const birthDate = new Date(formData.birthDate);
      const today = new Date();

      if (birthDate >= today) {
        setError('Birth date must be in the past');
        return;
      }

      const age = calculateAge(formData.birthDate);
      if (age < 10) {
        setError('You must be at least 10 years old');
        return;
      }

      if (age > 150) {
        setError('Please enter a valid birth date');
        return;
      }
    }

    // Nếu validation pass, chuyển sang bước tiếp theo hoặc submit
    if (step < 6) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const totalSteps = 6;
  const currentBMI = formData.height && formData.weight
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : 0;
  const currentBMICategory = currentBMI > 0 ? getBMICategory(currentBMI) : '';

  // Calculate age for display if birthDate is entered
  const displayAge = formData.birthDate ? calculateAge(formData.birthDate) : null;

  // Get goal suggestion based on BMI
  const getGoalSuggestion = () => {
    if (!currentBMI) return null;

    if (currentBMI < 18.5) {
      return {
        suggested: 'gain_weight' as GoalType,
        icon: <TrendingUp className="w-5 h-5" />,
        message: 'Based on your BMI, gaining weight might be beneficial for your health.',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
      };
    } else if (currentBMI >= 25) {
      return {
        suggested: 'lose_weight' as GoalType,
        icon: <TrendingDown className="w-5 h-5" />,
        message: 'Based on your BMI, losing weight might be beneficial for your health.',
        color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30'
      };
    } else {
      return {
        suggested: 'maintain' as GoalType,
        icon: <Minus className="w-5 h-5" />,
        message: 'Your BMI is in the healthy range. Maintaining your current weight is recommended.',
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
      };
    }
  };

  const goalSuggestion = step === 3 ? getGoalSuggestion() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Step {step} of {totalSteps}
          </p>

          <div className="mb-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${i <= step
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Step 1: Height */}
            {step === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm) *
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="e.g., 175"
                    min="100"
                    max="250"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Current Weight */}
            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Weight (kg) *
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="e.g., 70"
                    min="30"
                    max="300"
                  />
                </div>
                {formData.height && formData.weight && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your current BMI: <span className="font-bold">{currentBMI.toFixed(1)}</span>
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-700">
                        {currentBMICategory}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Goal */}
            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What's your goal? *
                </label>

                {/* BMI-based suggestion */}
                {goalSuggestion && (
                  <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${goalSuggestion.color}`}>
                    {goalSuggestion.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {goalSuggestion.message}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {Object.entries(GOAL_OPTIONS).map(([key, label]) => {
                    const isRecommended = goalSuggestion?.suggested === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal: key as GoalType })}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${formData.goal === key
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </span>
                          {isRecommended && (
                            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-200 dark:bg-emerald-700 text-emerald-800 dark:text-emerald-200 font-semibold">
                              Recommended
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Weight Goal */}
            {step === 4 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Weight (kg) - Optional
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.weightGoal}
                    onChange={(e) => handleWeightGoalChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="e.g., 65 (optional)"
                    min="30"
                    max="300"
                  />
                </div>
                {weightGoalWarning && (
                  <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${weightGoalWarning.includes('✅')
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-orange-50 dark:bg-orange-900/20'
                    }`}>
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${weightGoalWarning.includes('✅')
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-orange-600 dark:text-orange-400'
                      }`} />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {weightGoalWarning}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Leave empty if you don't have a specific weight goal
                </p>
              </div>
            )}

            {/* Step 5: Birth Date */}
            {step === 5 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birth Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
                {displayAge !== null && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your age: <span className="font-bold">{displayAge} years old</span>
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  We calculate your age from your birth date
                </p>
              </div>
            )}

            {/* Step 6: Gender & Activity Level */}
            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['male', 'female', 'other'] as const).map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender })}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.gender === gender
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                          }`}
                      >
                        <Users className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {gender}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Level *
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
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading || createProfileLoading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading || createProfileLoading ? 'Saving...' : step === 6 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}