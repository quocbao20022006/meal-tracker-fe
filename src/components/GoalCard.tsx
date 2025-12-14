import MetricCard from "./MetricCard";

interface GoalCardProps {
  targetWeight: number; // in kg
  planType: "Moderate" | "High" | "Low";
  description?: string;
}

export default function GoalCard({
  targetWeight,
  planType,
  description = "Your personalized plan to reach the target weight",
}: GoalCardProps) {
  // Plan color mapping
  const planColors: Record<string, string> = {
    Moderate: "bg-yellow-400 text-yellow-800",
    High: "bg-green-400 text-green-800",
    Low: "bg-red-400 text-red-800",
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Your Goal
      </h2>

      {/* Target Weight */}
      <div className="flex justify-between gap-4">
        <MetricCard value="49 kg" label="Target Weight" />
        <MetricCard
          value="22.3"
          label="BMI"
          color="text-yellow-700"
          bgColor="bg-yellow-500/10 dark:bg-yellow-500/20"
        />
        <MetricCard
          value="1500 kcal"
          label="Total Daily Calories"
          color="text-blue-700"
          bgColor="bg-blue-500/10 dark:bg-blue-500/20"
        />
      </div>

      {/* Plan */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-300">Eating Plan:</span>
        <span
          className={`px-3 py-1 rounded-full font-medium ${planColors[planType]}`}
        >
          {planType}
        </span>
      </div>

      {/* Optional description */}
      <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}
