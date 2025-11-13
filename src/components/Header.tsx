import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function Header({ title, searchValue = '', onSearchChange }: HeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>

        <div className="flex items-center gap-4">
          {onSearchChange && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search meals..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>
          )}

          <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
