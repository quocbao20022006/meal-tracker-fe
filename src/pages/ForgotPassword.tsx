import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import * as authService from '../services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.forgotPassword({ email });
      if (result.error) {
        setError(result.error.message || 'Failed to send OTP');
      } else {
        // Navigate to verify OTP page with email param
        navigate('/verify-otp', { state: { email } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
            Reset Password
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Enter your email to receive an OTP code
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                We'll send a verification code to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
