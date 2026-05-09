"use client";

import {
  Timer,
  Users,
  Layers,
  TrendingUp,
  Target,
  Calendar,
  Sparkles,
  Activity,
  Flame,
} from "lucide-react";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/card";
import WeeklyProgressCard from "../../components/weekly-progress-card";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Exam, RawWeeklyProgressItem, WeeklyProgressItem } from "@/app/types";
import { calculateWeeklyProgress } from "@/utils/UserInfoFunctions";

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  const exam = new Date(y, m - 1, d);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

async function getUpcomingExams(): Promise<Exam[]> {
  try {
    const response = await axios.get<Exam[]>(`/api/exam/next`);

    if (response.status !== 200) {
      return [];
    }

    const payload = await response.data;
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload;
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressItem[]>([
    { day: "Mon", minutes: 0 },
    { day: "Tue", minutes: 0 },
    { day: "Wed", minutes: 0 },
    { day: "Thu", minutes: 0 },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 },
  ]);
  const [todayStats, setTodayStats] = useState({
    "Pomodoro Sessions": 0,
    "Study Hours": 0,
    "Flashcards Reviewed": 0,
    "Day Streak": 0,
  });

  const weeklyProgressProcess = useCallback(
    (rawWeekly: RawWeeklyProgressItem[]) => {
      const {
        weeklyProgress: weeklyProgressNew,
        studyHours,
        pomodoroSessions,
      } = calculateWeeklyProgress(rawWeekly, weeklyProgress) || {};

      setWeeklyProgress(weeklyProgressNew ?? []);

      setTodayStats({
        ...todayStats,
        "Study Hours": studyHours ?? 0,
        "Pomodoro Sessions": pomodoroSessions ?? 0,
      });
    },
    [todayStats, weeklyProgress],
  );

  useEffect(() => {
    getUpcomingExams().then(setUpcomingExams);
  }, []);

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      try {
        await fetch(`/api/timer/week`, {})
          .then((r) => r.json())
          .then((w) => weeklyProgressProcess(w))
          .catch((e) => {
            console.error("Error fetching weekly progress:", e);
            return [];
          });
      } catch {
        return [];
      }
    };

    fetchWeeklyProgress();
  }, []);

  const statCards = useMemo(() => {
    return [
      {
        label: "Pomodoro Sessions",
        value: todayStats["Pomodoro Sessions"],
        icon: <Timer className="size-6 text-red-800" />,
        bgColor: "#f4c2c2",
      },
      {
        label: "Study Hours",
        value: todayStats["Study Hours"],
        icon: <Activity className="size-6 text-blue-800" />,
        bgColor: "#dbeafe",
      },
      {
        label: "Flashcards Reviewed",
        value: todayStats["Flashcards Reviewed"],
        icon: <Layers className="size-6 text-green-800" />,
        bgColor: "#c1e1c1",
      },
      { label: "Day Streak", value: todayStats["Day Streak"], icon: <Flame className="size-6 text-orange-800" />, bgColor: "#ffe4b5" },
    ];
  }, [todayStats]);

  return (
    <div className="w-full bg-switch-background/20">
      <div className="space-y-6 py-8 px-20 w-7xl">
        <div>
          <h1 className="text-3xl mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here is your study overview for today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((item, i) => {
            return (
              <Card key={i}>
                <CardContent className="p-6 ">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600">{item.label}</p>
                      <p className="text-3xl mt-1">{item.value}</p>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      {item.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card style={{ paddingBottom: 24, paddingLeft: 24 }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 flow-row">
            <Link href="/timer">
              <button className="gap-2 border-1 rounded-md p-2 flex items-center ">
                <Timer className="size-4" />
                <p>Start Timer</p>
              </button>
            </Link>
            <Link href="/ai-assistant">
              <button className="gap-2 border-1 rounded-md p-2 flex items-center ">
                <Sparkles className="size-4" />
                <p>Ask AI Assistant</p>
              </button>
            </Link>
            <Link href="/rooms">
              <button className="gap-2 border-1 rounded-md p-2 flex items-center ">
                <Users className="size-4" />
                <p>Join Study Room</p>
              </button>
            </Link>
            <Link href="/flashcards">
              <button className="gap-2 border-1 rounded-md p-2 flex items-center ">
                <Layers className="size-4" />
                <p>Review Flashcards</p>
              </button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyProgressCard weeklyProgress={weeklyProgress} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.id ?? `${exam.subjectName}-${exam.examDate}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{exam.subjectName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exam.examDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Target className="size-4" />
                        <span className="font-medium">
                          {getDaysUntil(exam.examDate)} days
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingExams.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No upcoming exams found.
                  </p>
                ) : null}
                <Link href="/exams">
                  <button className="w-full">View All Exams</button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
