/**
 * Format số thành currency
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format số với 2 chữ số thập phân
 */
export function formatDecimal(value: number, decimals = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Format ngày thành string (YYYY-MM-DD)
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Format ngày hiển thị (12/11/2024)
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US');
}

/**
 * Format thời gian (HH:MM)
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Tính tổng macros từ một mảng meal plans
 */
export function calculateTotalMacros(
  items: any[],
  fieldName: string = 'meals'
) {
  return items.reduce(
    (acc, item) => {
      const meal = item[fieldName];
      if (meal) {
        const servings = item.servings || 1;
        return {
          calories: acc.calories + meal.calories * servings,
          protein: acc.protein + meal.protein * servings,
          carbs: acc.carbs + meal.carbs * servings,
          fats: acc.fats + meal.fats * servings,
        };
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

/**
 * Tính phần trăm macro
 */
export function calculateMacroPercentage(
  macro: number,
  totalCalories: number
): number {
  if (totalCalories === 0) return 0;
  // Protein & carbs: 4 cal/g, Fat: 9 cal/g
  const macroCalories = macro * (macro === 0 ? 1 : macro > 50 ? 9 : 4);
  return (macroCalories / totalCalories) * 100;
}

/**
 * Parse lỗi từ API response
 */
export function parseApiError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.data?.message) {
    return error.data.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}
