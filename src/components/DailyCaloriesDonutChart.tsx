import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CalorieProgressProps {
  goal: number;       // total daily calories
  consumed: number;   // calories already consumed
}

interface CalorieProgressProps {
  goal: number;       // total daily calories
  consumed: number;   // calories already consumed
  size?: number;      // optional chart size
}

export default function DailyCaloriesDonutChart({
  goal,
  consumed,
  size = 150,
}: CalorieProgressProps) {
  const remaining = Math.max(goal - consumed, 0);
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100);

  // Gradient for consumed calories
  const gradientColors = (ctx: any) => {
    const chart = ctx.chart;
    const { ctx: canvasCtx, chartArea } = chart;

    if (!chartArea) return null; // chart not ready

    const gradient = canvasCtx.createLinearGradient(0, 0, 0, chartArea.bottom);
    gradient.addColorStop(0, "#34D399"); // top green
    gradient.addColorStop(1, "#10B981"); // bottom emerald
    return gradient;
  };

  const data = {
    labels: ["Consumed", "Remaining"],
    datasets: [
      {
        data: [consumed, remaining],
        backgroundColor: (ctx: any) => [
          gradientColors(ctx),
          "#E5E7EB", // light gray for remaining
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // important to fit container
    cutout: "75%",
    animation: {
      animateRotate: true,
      animateScale: true,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw} kcal`;
          },
        },
      },
    },
  };

  const centerText = (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "1.3rem",
      color: "#374151",
    }}>
      <div>{consumed} / {goal} kcal</div>
      <div style={{ fontSize: "1rem", color: "#10B981" }}>{percentage}%</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Note below chart */}
      <p className="mb-4 text-center text-gray-500 dark:text-gray-300 text-sm px-2">
        <span>Daily calorie consumption progress</span>
      </p>

      <div style={{ width: size, height: size, position: "relative" }}>
        <Doughnut data={data} options={options} />
        {centerText}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 inline-block rounded-sm" />
          <span className="text-gray-700 dark:text-gray-200 text-sm">Consumed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-300 inline-block rounded-sm" />
          <span className="text-gray-700 dark:text-gray-200 text-sm">Remaining</span>
        </div>
      </div>
    </div>
  );
}

