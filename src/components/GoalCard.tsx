import MetricCard from "./MetricCard";

interface GoalCardProps {
  targetWeight: number;
  currentWeight: number;
  currentBMI: number;
  dailyCalories: number;
  planType: "Moderate" | "High" | "Low";
  description?: string;
}

export default function GoalCard({
  targetWeight,
  currentWeight,
  currentBMI,
  dailyCalories,
  planType,
  description = "Your personalized plan to reach the target weight",
}: GoalCardProps) {
  // Plan color mapping
  const planColors: Record<string, string> = {
    Moderate: "bg-yellow-400 text-yellow-800",
    High: "bg-green-400 text-green-800",
    Low: "bg-red-400 text-red-800",
  };

  // BMI Category color
  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return { color: "text-blue-700", bg: "bg-blue-500/10 dark:bg-blue-500/20" };
    if (bmi < 25) return { color: "text-green-700", bg: "bg-green-500/10 dark:bg-green-500/20" };
    if (bmi < 30) return { color: "text-yellow-700", bg: "bg-yellow-500/10 dark:bg-yellow-500/20" };
    return { color: "text-red-700", bg: "bg-red-500/10 dark:bg-red-500/20" };
  };

  // Weight difference
  const weightDifference = currentWeight - targetWeight;
  const isGoalAchieved = Math.abs(weightDifference) <= 0.5; // within 0.5kg tolerance

  const bmiStyle = getBMIColor(currentBMI);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Your Goal
      </h2>

      {/* Metrics Grid */}
      <div className="flex justify-between gap-4">
        <MetricCard
          value={`${targetWeight} kg`}
          label="Target Weight"
        />
        <MetricCard
          value={currentBMI.toFixed(1)}
          label="Current BMI"
          color={bmiStyle.color}
          bgColor={bmiStyle.bg}
        />
        <MetricCard
          value={`${dailyCalories} kcal`}
          label="Daily Goal"
          color="text-blue-700"
          bgColor="bg-blue-500/10 dark:bg-blue-500/20"
        />
      </div>

      {/* Plan Type */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-300">Eating Plan:</span>
        <span
          className={`px-3 py-1 rounded-full font-medium ${planColors[planType]}`}
        >
          {planType}
        </span>
      </div>

      {/* Progress Status */}
      {targetWeight > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Current Weight:
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {currentWeight} kg
            </span>
          </div>

          {!isGoalAchieved && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {weightDifference > 0 ? "To Lose:" : "To Gain:"}
              </span>
              <span className={`text-sm font-semibold ${weightDifference > 0 ? "text-orange-600" : "text-green-600"
                }`}>
                {Math.abs(weightDifference).toFixed(1)} kg
              </span>
            </div>
          )}

          {isGoalAchieved && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="text-xl">🎉</span>
              <span className="text-sm font-semibold">
                Goal Achieved!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}