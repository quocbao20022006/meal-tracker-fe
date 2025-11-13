import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Scale, Calendar, Users } from 'lucide-react';

export default function Onboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number): 'Underweight' | 'Normal' | 'Overweight' | 'Obese' => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const calculateDailyCalories = (weight: number, height: number, age: number, gender: string) => {
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    return Math.round(bmr * 1.375);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);

      if (!weight || !height || !age) {
        setError('Please fill in all fields with valid numbers');
        setLoading(false);
        return;
      }

      const bmi = calculateBMI(weight, height);
      const bmiCategory = getBMICategory(bmi);
      const dailyCalories = calculateDailyCalories(weight, height, age, formData.gender);

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user!.id,
          height,
          weight,
          age,
          gender: formData.gender,
          bmi: parseFloat(bmi.toFixed(2)),
          bmi_category: bmiCategory,
          daily_calorie_goal: dailyCalories
        });

      if (insertError) throw insertError;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.height) {
      setError('Please enter your height');
      return;
    }
    if (step === 2 && !formData.weight) {
      setError('Please enter your weight');
      return;
    }
    if (step === 3 && !formData.age) {
      setError('Please enter your age');
      return;
    }
    setError('');
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

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
            Step {step} of 4
          </p>

          <div className="mb-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    i <= step
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
            {step === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm)
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="e.g., 175"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="e.g., 70"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="e.g., 25"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['male', 'female', 'other'] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.gender === gender
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
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Saving...' : step === 4 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
