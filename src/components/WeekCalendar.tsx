import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface WeekCalendarProps {
  onDateChange?: (date: string) => void;
}

// Helper: get dates of current week (Sunday → Saturday)
function getCurrentWeekDates(refDate: Date = new Date()) {
  const weekStart = new Date(refDate);
  weekStart.setDate(refDate.getDate() - refDate.getDay()); // Sunday
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// Format date as "Mon 16"
function formatDate(date: Date) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${dayNames[date.getDay()]} ${date.getDate()}`;
}

export default function WeekCalendar({ onDateChange }: WeekCalendarProps) {
  const today = new Date();
  const [weekDates, setWeekDates] = useState<Date[]>(getCurrentWeekDates());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Navigate to previous day
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate.toISOString().split("T")[0]);

    // update week if date goes out of current week
    if (!weekDates.some(d => d.toDateString() === newDate.toDateString())) {
      setWeekDates(getCurrentWeekDates(newDate));
    }
  };

  // Navigate to next day
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate.toISOString().split("T")[0]);

    // update week if date goes out of current week
    if (!weekDates.some(d => d.toDateString() === newDate.toDateString())) {
      setWeekDates(getCurrentWeekDates(newDate));
    }
  };

  // Check if date is today
  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md flex flex-col gap-4">
      {/* Header Buttons */}
      <div className="flex justify-between w-full">
        <button
          onClick={handlePrevDay}
          className="p-4 rounded-full border border-emerald-500 hover:bg-emerald-300 dark:hover:bg-emerald-600 transition"
        >
          <ArrowLeft />
        </button>
        <button
          onClick={handleNextDay}
          className="p-4 rounded-full border border-emerald-500 hover:bg-emerald-300 dark:hover:bg-emerald-600 transition"
        >
          <ArrowRight />
        </button>
      </div>

      {/* Week Dates */}
      <div className="flex justify-between gap-2 w-full">
        {weekDates.map((date) => {
          const selected = date.toDateString() === selectedDate.toDateString();
          return (
            <div
              key={date.toDateString()}
              onClick={() => {
                setSelectedDate(date);
                onDateChange?.(date.toISOString().split("T")[0]);
              }}
              className={`flex-1 py-3 rounded-2xl cursor-pointer flex flex-col items-center justify-center transition
                ${
                  selected
                    ? "bg-emerald-500 text-white font-semibold shadow-md"
                    : isToday(date)
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              <span className="text-sm md:text-base">{formatDate(date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
