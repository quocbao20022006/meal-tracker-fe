import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeekDateSliderProps {
  weekDates: Date[];
  selectedDate: string;
  dateIndex: number;

  onSelectDate: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const formatDate = (date: Date) =>
  date.toISOString().split("T")[0];

export default function WeekDateSlider({
  weekDates,
  selectedDate,
  dateIndex,
  onSelectDate,
  onPrev,
  onNext,
}: WeekDateSliderProps) {
  const todayStr = formatDate(new Date());

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            {/* Previous */}
            {dateIndex > 0 && (
              <button
                onClick={onPrev}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Previous week"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Days */}
            <div className="flex-1 grid grid-cols-7 gap-2">
              {weekDates
                .slice(dateIndex, dateIndex + 7)
                .map((date) => {
                  const dateStr = formatDate(date);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => onSelectDate(dateStr)}
                      className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1
                        ${
                          isSelected
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium"
                            : isToday
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-400"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <span className="text-xs">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                          date.getDay()
                        ]}
                      </span>
                      <span className="text-lg font-bold">
                        {date.getDate()}/{date.getMonth() + 1}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Next */}
            {dateIndex + 7 < weekDates.length && (
              <button
                onClick={onNext}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Next week"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Selected date info */}
          <div className="text-center text-sm text-muted-foreground mt-2">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
