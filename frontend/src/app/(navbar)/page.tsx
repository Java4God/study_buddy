/*
import {
  Timer,
  Users,
  Layers,
  TrendingUp,
  Flame,
  Clock,
  Target,
  Calendar,
  Sparkles,
} from "lucide-react";
 */
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";

export default function DashboardPage() {
  // Mock data
  const todayStats = {
    pomodoroSessions: 6,
    studyHours: 3,
    flashcardsReviewed: 24,
    streak: 7,
  };

  const upcomingExams = [
    { id: 1, subject: "Calculus II", date: "2026-03-28", daysLeft: 6 },
    { id: 2, subject: "Modern History", date: "2026-04-02", daysLeft: 11 },
    { id: 3, subject: "Chemistry", date: "2026-04-05", daysLeft: 14 },
  ];

  const weeklyProgress = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3 },
    { day: "Wed", hours: 2 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 3.5 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 3 },
  ];

  const maxHours = Math.max(...weeklyProgress.map((d) => d.hours));

  return (
    <div className="space-y-6 py-8 px-20">
      <div>
        <h1 className="text-3xl mb-2">Welcome back!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here is your study overview for today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pomodoros Today
                </p>
                <p className="text-3xl mt-1">{todayStats.pomodoroSessions}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                {/*<Timer className="size-6 text-red-600 dark:text-red-400" />*/}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Study Hours
                </p>
                <p className="text-3xl mt-1">{todayStats.studyHours}h</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                {/*<Clock className="size-6 text-blue-600 dark:text-blue-400" />*/}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Flashcards
                </p>
                <p className="text-3xl mt-1">{todayStats.flashcardsReviewed}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                {/*<Layers className="size-6 text-purple-600 dark:text-purple-400" />*/}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Day Streak
                </p>
                <p className="text-3xl mt-1">{todayStats.streak}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                {/*<Flame className="size-6 text-orange-600 dark:text-orange-400" />*/}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 flow-row">
          <Link href="/timer">
            <button className="gap-2 border-1 rounded-md p-2">
              {/*<Timer className="size-4" />*/}
              Start Timer
            </button>
          </Link>
          <Link href="/ai-assistant">
            <button className="gap-2 border-1 rounded-md p-2">
              {/*<Sparkles className="size-4" />*/}
              Ask AI Assistant
            </button>
          </Link>
          <Link href="/rooms">
            <button className="gap-2 border-1 rounded-md p-2">
              {/*<Users className="size-4" />*/}
              Join Study Room
            </button>
          </Link>
          <Link href="/flashcards">
            <button className="gap-2 border-1 rounded-md p-2">
              {/*<Layers className="size-4" />*/}
              Review Flashcards
            </button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/*<TrendingUp className="size-5" />*/}
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {day.day}
                    </span>
                    <span>{day.hours}h</span>
                  </div>
                  {/*<Progress value={(day.hours / maxHours) * 100} />*/}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/*<Calendar className="size-5" />*/}
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="font-medium">{exam.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(exam.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      {/*<Target className="size-4" />*/}
                      <span className="font-medium">{exam.daysLeft} days</span>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/exams">
                <button className="w-full">View All Exams</button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
