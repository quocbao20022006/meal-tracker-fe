import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register once (important!)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function BarChart() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu"],
    datasets: [
      {
        label: "Calories",
        data: [200, 450, 300, 500],
      },
    ],
  };

  return <Bar data={data} />;
}
