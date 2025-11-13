import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Bell, Shield, Database } from 'lucide-react';
import Header from '../components/Header';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Appearance
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Moon className="w-5 h-5 text-emerald-500" />
                )}
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Theme</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  theme === 'dark' ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all ${
                    theme === 'dark' ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Notifications
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Meal Reminders</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified about your upcoming meals
                    </p>
                  </div>
                </div>
                <button className="relative w-14 h-7 bg-emerald-500 rounded-full">
                  <div className="absolute w-5 h-5 bg-white rounded-full top-1 right-1" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Daily Summary</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive daily nutrition summary
                    </p>
                  </div>
                </div>
                <button className="relative w-14 h-7 bg-gray-300 rounded-full">
                  <div className="absolute w-5 h-5 bg-white rounded-full top-1 left-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Privacy & Security
            </h3>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all text-left">
                <Shield className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Change Password</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your account password
                  </p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all text-left">
                <Database className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Export Data</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download your meal history as CSV
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              About
            </h3>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span>Version</span>
                <span className="font-medium text-gray-800 dark:text-white">1.0.0</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span>Made with</span>
                <span className="font-medium text-gray-800 dark:text-white">React + Supabase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
