import { BMIValidation } from '../types';

/**
 * Tính BMI từ weight và height
 * @param weight Cân nặng (kg)
 * @param height Chiều cao (cm)
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
    if (height <= 0 || weight <= 0) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
}

/**
 * Phân loại BMI
 */
export function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

/**
 * Tính khoảng cân nặng khuyến nghị dựa trên chiều cao
 * @param height Chiều cao (cm)
 * @returns { min, max } - Khoảng cân nặng khuyến nghị (kg)
 */
export function getRecommendedWeightRange(height: number): { min: number; max: number } {
    const heightInMeters = height / 100;
    const minWeight = 18.5 * heightInMeters * heightInMeters;
    const maxWeight = 24.9 * heightInMeters * heightInMeters;
    return {
        min: Math.round(minWeight * 10) / 10,
        max: Math.round(maxWeight * 10) / 10,
    };
}

/**
 * Validate weight goal dựa trên BMI
 * @param height Chiều cao (cm)
 * @param weightGoal Mục tiêu cân nặng (kg)
 * @returns BMIValidation object
 */
export function validateWeightGoal(height: number, weightGoal: number): BMIValidation {
    if (height <= 0 || weightGoal <= 0) {
        return {
            isValid: false,
            message: 'Invalid height or weight goal',
            recommendedMinWeight: 0,
            recommendedMaxWeight: 0,
            bmiAtGoal: 0,
        };
    }

    const bmiAtGoal = calculateBMI(weightGoal, height);
    const { min, max } = getRecommendedWeightRange(height);
    const category = getBMICategory(bmiAtGoal);

    // BMI trong khoảng 18.5 - 24.9 là lý tưởng
    const isHealthyBMI = bmiAtGoal >= 18.5 && bmiAtGoal <= 24.9;

    let message = '';
    if (bmiAtGoal < 18.5) {
        message = `⚠️ Warning: Goal weight results in Underweight BMI (${bmiAtGoal.toFixed(1)}). Recommended: ${min.toFixed(1)} - ${max.toFixed(1)} kg`;
    } else if (bmiAtGoal >= 25 && bmiAtGoal < 30) {
        message = `⚠️ Warning: Goal weight results in Overweight BMI (${bmiAtGoal.toFixed(1)}). Recommended: ${min.toFixed(1)} - ${max.toFixed(1)} kg`;
    } else if (bmiAtGoal >= 30) {
        message = `⚠️ Warning: Goal weight results in Obese BMI (${bmiAtGoal.toFixed(1)}). Recommended: ${min.toFixed(1)} - ${max.toFixed(1)} kg`;
    } else {
        message = `✅ Good! Goal weight results in healthy BMI (${bmiAtGoal.toFixed(1)})`;
    }

    return {
        isValid: isHealthyBMI,
        message,
        recommendedMinWeight: min,
        recommendedMaxWeight: max,
        bmiAtGoal: Math.round(bmiAtGoal * 10) / 10,
    };
}

/**
 * Get color cho BMI category
 */
export function getBMICategoryColor(category: string): string {
    switch (category) {
        case 'Underweight':
            return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
        case 'Normal':
            return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
        case 'Overweight':
            return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30';
        case 'Obese':
            return 'text-red-600 bg-red-50 dark:bg-red-900/30';
        default:
            return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30';
    }
}