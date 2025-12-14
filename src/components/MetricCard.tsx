import React from "react";

interface MetricCardProps {
  value: string | number;
  label: string;
  color?: string; // Tailwind color for value text
  bgColor?: string; // Tailwind color for background
  className?: string; // extra classes
}

export default function MetricCard({
  value,
  label,
  color = "text-emerald-700",
  bgColor = "bg-emerald-500/10 dark:bg-emerald-500/20",
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`flex flex-col justify-center items-center rounded-xl p-4 w-full aspect-square ${bgColor} ${className}`}
    >
      <span className={`text-2xl text-center font-bold ${color}`}>{value}</span>
      <span className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
        {label}
      </span>
    </div>
  );
}
