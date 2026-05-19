"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CalendarHeatmap from "react-calendar-heatmap";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { WeeklyPomodoroDTO } from "@/app/types";

type HeatmapRangeKey = "90" | "180" | "365";

type HeatmapPoint = {
  date: string;
  count: number;
  totalMinutes: number;
};

const RANGE_OPTIONS: Array<{ label: string; value: HeatmapRangeKey }> = [
  { label: "3 months", value: "90" },
  { label: "6 months", value: "180" },
  { label: "1 year", value: "365" },
];

const DEFAULT_RANGE_DAYS: HeatmapRangeKey = "365";

const TWO_HOURS_MINUTES = 120;
const ONE_HOUR_MINUTES = 60;

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractDays(baseDate: Date, days: number) {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() - days);
  return nextDate;
}

function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(minutes === 0 ? 0 : 1)}h`;
}

function getHeatmapClass(minutes: number) {
  if (minutes >= TWO_HOURS_MINUTES) {
    return "fill-emerald-500";
  }

  if (minutes >= ONE_HOUR_MINUTES) {
    return "fill-orange-400";
  }

  return "fill-red-500";
}

function getDateRange(days: number) {
  const to = new Date();
  const from = subtractDays(to, days - 1);

  return {
    from: toLocalDateString(from),
    to: toLocalDateString(to),
  };
}

export default function PomodoroHeatmap() {
  const [rangeDays, setRangeDays] =
    useState<HeatmapRangeKey>(DEFAULT_RANGE_DAYS);
  const [data, setData] = useState<WeeklyPomodoroDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHeatmap = async () => {
      const range = getDateRange(Number(rangeDays));
      setLoading(true);
      setError("");

      try {
        const response = await axios.get<WeeklyPomodoroDTO[]>(
          `/api/timer/heatmap?from=${range.from}&to=${range.to}`,
        );
        setData(Array.isArray(response.data) ? response.data : []);
      } catch {
        setError("Unable to load heatmap data.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchHeatmap();
  }, [rangeDays]);

  const heatmapValues = useMemo<HeatmapPoint[]>(() => {
    const mapByDate = new Map(
      data.map((item) => [item.date, Number(item.totalMinutes ?? 0)]),
    );

    const range = getDateRange(Number(rangeDays));
    const from = new Date(`${range.from}T00:00:00`);
    const to = new Date(`${range.to}T00:00:00`);
    const values: HeatmapPoint[] = [];

    for (
      let current = new Date(from);
      current <= to;
      current.setDate(current.getDate() + 1)
    ) {
      const date = toLocalDateString(current);
      const totalMinutes = mapByDate.get(date) ?? 0;

      values.push({
        date,
        count: totalMinutes,
        totalMinutes,
      });
    }

    return values;
  }, [data, rangeDays]);

  const totalMinutes = heatmapValues.reduce(
    (sum, item) => sum + item.totalMinutes,
    0,
  );

  const startDate =
    heatmapValues[0]?.date ?? getDateRange(Number(rangeDays)).from;
  const endDate =
    heatmapValues[heatmapValues.length - 1]?.date ??
    getDateRange(Number(rangeDays)).to;

  return (
    <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur p-6 rounded-xl">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-medium">
            Pomodoro Heatmap
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="heatmap-range" className="text-xs text-slate-600">
              Range
            </label>
            <select
              id="heatmap-range"
              value={rangeDays}
              onChange={(event) =>
                setRangeDays(event.target.value as HeatmapRangeKey)
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{formatHours(totalMinutes)} total</span>
          <span>Days without study time appear as 0h.</span>
          {loading ? <span>Loading...</span> : null}
          {error ? <span className="text-red-600">{error}</span> : null}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-5 pt-1">
        <div className="min-w-[620px] rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
          <CalendarHeatmap
            startDate={new Date(`${startDate}T00:00:00`)}
            endDate={new Date(`${endDate}T00:00:00`)}
            values={heatmapValues}
            classForValue={(value: HeatmapPoint | null) => {
              if (!value) {
                return "heatmap-empty";
              }

              return `heatmap-value ${getHeatmapClass(value.totalMinutes)}`;
            }}
            titleForValue={(value: HeatmapPoint | null) => {
              if (!value) {
                return "0h";
              }

              return `${value.date}: ${formatHours(value.totalMinutes)}`;
            }}
            showWeekdayLabels
            weekdayLabels={["S", "M", "T", "W", "T", "F", "S"]}
            gutterSize={1}
          />
        </div>
      </CardContent>
      <style jsx global>{`
        .react-calendar-heatmap {
          width: 100%;
        }

        .react-calendar-heatmap text {
          font-size: 10px;
          fill: #64748b;
        }

        .react-calendar-heatmap .heatmap-empty {
          fill: #ffffff;
          stroke: #e2e8f0;
          rx: 3px;
          ry: 3px;
        }

        .react-calendar-heatmap .heatmap-value {
          stroke: #ffffff;
          rx: 3px;
          ry: 3px;
        }

        .react-calendar-heatmap .fill-red-500 {
          fill: #ef4444;
        }

        .react-calendar-heatmap .fill-orange-400 {
          fill: #fb923c;
        }

        .react-calendar-heatmap .fill-emerald-500 {
          fill: #10b981;
        }
      `}</style>
    </Card>
  );
}
