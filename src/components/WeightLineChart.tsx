// import { useEffect, useState } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Line } from "react-chartjs-2";
// import { UserResponse } from "@/types";
// import { getProfile } from "@/services/user-profile.service";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend
// );

// const MONTH_LABELS = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// // const SAMPLE_WEIGHT_DATA = [
// //   62.0, 61.7, 61.9, 61.4, 61.2, 61.0,
// //   61.3, 60.9, 60.7, 60.8, 60.4, 60.2
// // ];

// export default function WeightLineChart({userId}: {userId?: number}) {
//   const [user, setUser] = useState<UserResponse | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!userId) return; // ✅ guard against undefined

//       try {
//         const data = await getProfile(userId);
//         setUser(data.data);
//       } catch (err) {
//         console.error("Error fetching user:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [userId]);

//   if (loading) return <p>Loading...</p>;
//   if (!user) return <p>User not found</p>;

//   // Example: Create some sample weight history based on current weight
//   // You can replace this with real historical weight data if available
//   const weightHistory = [
//     user.weight! + 2,
//     user.weight! + 1.5,
//     user.weight! + 1,
//     user.weight! + 0.5,
//     user.weight!,
//   ];
//   console.log("Weight History:", Number(user.weight));

//   const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//   const data = {
//     labels,
//     datasets: [
//       {
//         label: "Weight (Kg)",
//         data: weightHistory,

//         // 🎨 Line & points
//         borderColor: "#3B82F6", // blue-500
//         backgroundColor: "rgba(59, 130, 246, 0.2)",
//         pointBackgroundColor: "#ffffff",
//         pointBorderColor: "#3B82F6",
//         pointRadius: 5,
//         pointHoverRadius: 7,
        
//         tension: 0.4,
//         fill: false,
//       },
//       {
//         label: "Goal Weight",
//         data: Array(12).fill(50),

//         // 🎨 Line & points
//         borderColor: "#10B981", // emerald-500
//         backgroundColor: "rgba(16, 185, 129, 0.2)",
//         pointBackgroundColor: "#ffffff",
//         pointBorderColor: "#10B981",
//         pointRadius: 5,
//         pointHoverRadius: 7,

//         // 🧠 Smooth UI
//         borderDash: [6, 6],
//         tension: 0.4,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         labels: {
//           color: "#374151", // gray-700
//           font: {
//             size: 14,
//           },
//         },
//       },
//       tooltip: {
//         backgroundColor: "#111827", // gray-900
//         titleColor: "#ffffff",
//         bodyColor: "#ffffff",
//       },
//     },
//     scales: {
//       x: {
//         ticks: {
//           color: "#6B7280", // gray-500
//         },
//         grid: {
//           color: "rgba(107, 114, 128, 0.1)",
//         },
//       },
//       y: {
//         ticks: {
//           color: "#6B7280",
//         },
//         grid: {
//           color: "rgba(107, 114, 128, 0.1)",
//         },
//         title: {
//           display: true,
//           text: "Weight (kg)",
//           color: "#374151",
//         },
//         min: 40,
//         max: 70,
//       },
//     },
//   };

//   return (
//     <div className="w-full">
//       <Line data={data} options={options} />
//     </div>
//   );
// }
