import { useState, useEffect } from 'react';
import { Scale, TrendingDown, TrendingUp, Target, X, Loader, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface WeightUpdateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentWeight: number;
    targetWeight?: number;
    userId: number;
    onUpdateSuccess: (newWeight: number) => void;
}

export default function WeightUpdateModal({
    open,
    onOpenChange,
    currentWeight,
    targetWeight,
    userId,
    onUpdateSuccess
}: WeightUpdateModalProps) {
    const [newWeight, setNewWeight] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [weightDifference, setWeightDifference] = useState<number>(0);

    useEffect(() => {
        if (open) {
            setNewWeight(currentWeight.toString());
            setError('');
            setShowSuccess(false);
            setWeightDifference(0);
        }
    }, [open, currentWeight]);

    const calculateDifference = (weight: string) => {
        const numWeight = parseFloat(weight);
        if (!isNaN(numWeight)) {
            const diff = currentWeight - numWeight;
            setWeightDifference(diff);
        }
    };

    const handleWeightChange = (value: string) => {
        setNewWeight(value);
        calculateDifference(value);
        setError('');
    };

    const getMotivationalMessage = () => {
        if (weightDifference === 0) {
            return { message: "Your weight remains the same", icon: "😊", color: "text-blue-600" };
        }

        if (weightDifference > 0) {
            // Lost weight
            if (weightDifference >= 5) {
                return {
                    message: `Amazing! You've lost ${weightDifference.toFixed(1)} kg! 🎉 Keep up the excellent work!`,
                    icon: "🏆",
                    color: "text-emerald-600"
                };
            } else if (weightDifference >= 2) {
                return {
                    message: `Great progress! You've lost ${weightDifference.toFixed(1)} kg! 💪`,
                    icon: "⭐",
                    color: "text-emerald-600"
                };
            } else {
                return {
                    message: `Good job! You've lost ${weightDifference.toFixed(1)} kg! Keep going!`,
                    icon: "✨",
                    color: "text-emerald-600"
                };
            }
        } else {
            // Gained weight
            const absGain = Math.abs(weightDifference);
            if (targetWeight && parseFloat(newWeight) <= targetWeight + 0.5) {
                return {
                    message: `You've gained ${absGain.toFixed(1)} kg, but you're still on track! 💪`,
                    icon: "💪",
                    color: "text-blue-600"
                };
            }
            return {
                message: `You've gained ${absGain.toFixed(1)} kg. Don't worry, every journey has ups and downs! 🌟`,
                icon: "🌟",
                color: "text-orange-600"
            };
        }
    };

    const handleSubmit = async () => {
        setError('');

        const weight = parseFloat(newWeight);
        if (isNaN(weight) || weight <= 0) {
            setError('Please enter a valid weight');
            return;
        }

        if (weight === currentWeight) {
            setError('Please enter a different weight');
            return;
        }

        if (weight < 30 || weight > 300) {
            setError('Weight must be between 30 and 300 kg');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

            const response = await fetch(`${API_BASE_URL}/user-management/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    weight: weight
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update weight');
            }

            const data = await response.json();
            console.log('Weight updated successfully:', data);
            setShowSuccess(true);

            // Wait 2 seconds to show success message, then close
            setTimeout(() => {
                onUpdateSuccess(weight);
                onOpenChange(false);
            }, 2000);

        } catch (err) {
            console.error('Error updating weight:', err);
            setError(err instanceof Error ? err.message : 'Failed to update weight. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const motivationalMsg = getMotivationalMessage();
    const progressToTarget = targetWeight ? ((currentWeight - parseFloat(newWeight)) / (currentWeight - targetWeight)) * 100 : 0;

    if (showSuccess) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Weight Updated! 🎉
                        </h2>
                        <div className={`text-center p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 ${motivationalMsg.color}`}>
                            <p className="text-lg font-semibold flex items-center justify-center gap-2">
                                <span className="text-2xl">{motivationalMsg.icon}</span>
                                {motivationalMsg.message}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Scale className="w-6 h-6 text-emerald-600" />
                        Update Your Weight
                    </DialogTitle>
                    <DialogDescription>
                        Track your progress by updating your current weight
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <X className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Current Weight Display */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Current Weight</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {currentWeight} kg
                            </span>
                        </div>
                        {targetWeight && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Target Weight</span>
                                <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                    {targetWeight} kg
                                </span>
                            </div>
                        )}
                    </div>

                    {/* New Weight Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                            New Weight (kg)
                        </label>
                        <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="number"
                                step="0.1"
                                value={newWeight}
                                onChange={(e) => handleWeightChange(e.target.value)}
                                className="pl-10 text-lg"
                                placeholder="Enter your weight"
                                min="30"
                                max="300"
                            />
                        </div>
                    </div>

                    {/* Weight Difference Indicator */}
                    {weightDifference !== 0 && (
                        <div className={`p-4 rounded-lg ${weightDifference > 0
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
                                : 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20'
                            }`}>
                            <div className="flex items-center gap-3">
                                {weightDifference > 0 ? (
                                    <TrendingDown className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold text-lg ${motivationalMsg.color}`}>
                                        {weightDifference > 0 ? 'Weight Loss' : 'Weight Gain'}: {Math.abs(weightDifference).toFixed(1)} kg
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {motivationalMsg.message}
                                    </p>
                                </div>
                            </div>

                            {/* Progress to Target */}
                            {targetWeight && weightDifference > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Progress to target</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            {Math.min(progressToTarget, 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(progressToTarget, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || weightDifference === 0}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Target className="w-4 h-4 mr-2" />
                                    Update Weight
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}