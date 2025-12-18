import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ActivePlanResponse } from "../types";

// Register once (important!)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface CaloriesBarChartProps {
  activePlan?: ActivePlanResponse | null;
  days?: number; // Number of days to display (default 7)
}

export default function BarChart({ activePlan, days = 7 }: CaloriesBarChartProps) {
  if (!activePlan) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <p>No active plan data available</p>
      </div>
    );
  }

  // Get data for last N days
  const today = new Date();
  const chartData: { [key: string]: number } = {};

  // Initialize all dates with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0];
    chartData[dateStr] = 0;
  }

  // Sum calories from meals for each date
  Object.entries(activePlan.mealsByDate).forEach(([date, meals]) => {
    if (chartData.hasOwnProperty(date)) {
      const totalCalories = meals.reduce(
        (sum: number, meal: any) => sum + meal.calories,
        0
      );
      chartData[date] = totalCalories;
    }
  });

  // Prepare chart data
  const labels = Object.keys(chartData).map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });

  const dataPoints = Object.values(chartData);

  const data = {
    labels,
    datasets: [
      {
        label: "Calories",
        data: dataPoints,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: document.documentElement.classList.contains("dark")
                ? "#f3f4f6"
                : "#111827",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#9ca3af"
                : "#6b7280",
            },
            grid: {
              color: document.documentElement.classList.contains("dark")
                ? "rgba(75, 85, 99, 0.2)"
                : "rgba(200, 200, 200, 0.1)",
            },
          },
          x: {
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#9ca3af"
                : "#6b7280",
            },
            grid: {
              color: document.documentElement.classList.contains("dark")
                ? "rgba(75, 85, 99, 0.2)"
                : "rgba(200, 200, 200, 0.1)",
            },
          },
        },
      }}
    />
  );
}
