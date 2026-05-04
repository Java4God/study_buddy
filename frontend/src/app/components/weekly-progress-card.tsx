"use client";

const TWO_HOURS_MINUTES = 120;
const ONE_HOUR_MINUTES = 60;

type WeeklyProgressItem = {
  day: string;
  minutes: number;
};

type WeeklyProgressCardProps = {
  weeklyProgress: WeeklyProgressItem[];
};

function getWeeklyProgressColor(minutes: number): string {
  if (minutes >= TWO_HOURS_MINUTES) {
    return "bg-emerald-500";
  }

  if (minutes >= ONE_HOUR_MINUTES) {
    return "bg-amber-400";
  }

  return "bg-red-500";
}

export default function WeeklyProgressCard({
  weeklyProgress,
}: WeeklyProgressCardProps) {
  return (
    <div className="space-y-4">
      {weeklyProgress.map((day) => (
        <div key={day.day} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{day.day}</span>
            <span>{(day.minutes / 60).toFixed(1)}h</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getWeeklyProgressColor(day.minutes)}`}
              style={{
                width: `${Math.min(100, (day.minutes / TWO_HOURS_MINUTES) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
