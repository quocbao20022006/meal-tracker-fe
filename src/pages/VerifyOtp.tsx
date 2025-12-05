import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import * as authService from '../services/auth.service';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
    } else {
      // Redirect to forgot password if email not provided
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOtp({ email, otp });
      if (result.error) {
        setError(result.error.message || 'Invalid OTP');
      } else {
        // Navigate to reset password page with email and otp
        navigate('/reset-password', { state: { email, otp } });
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
          onClick={() => navigate('/forgot-password')}
          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
            Verify OTP
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Enter the 6-digit code sent to {email}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all text-center text-3xl tracking-widest font-semibold"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter the verification code we sent to your email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
            Didn't receive the code?{' '}
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
