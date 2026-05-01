import {
  Timer,
  Users,
  Layers,
  TrendingUp,
  Target,
  Calendar,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/card";

export default function DashboardPage() {
  // Mock data
  const todayStats = {
    "Pomodoro Sessions": 6,
    "Study Hours": 3,
    "Flashcards Reviewed": 24,
    "Day Streak": 7,
  };
  const colorPairs = [
    { bg: "#f4c2c2", text: "#8b4a4a" },
    { bg: "#add8e6", text: "#2f5d73" },
    { bg: "#c1e1c1", text: "#3e6b3e" },
    { bg: "#fff5ba", text: "#8a7a2f" },
  ];

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

  return (
    <div className="space-y-6 py-8 px-20 bg-switch-background/20">
      <div>
        <h1 className="text-3xl mb-2">Welcome back!</h1>
        <p className="text-gray-600">Here is your study overview for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(todayStats).map(([key, value], i) => {
          return (
            <Card key={key}>
              <CardContent className="p-6 ">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-600">{key}</p>
                    <p className="text-3xl mt-1">{value}</p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: colorPairs[i].bg }}
                  >
                    <Timer
                      className="size-6"
                      style={{ color: colorPairs[i].text }}
                    />
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
            <div className="space-y-4">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{day.day}</span>
                    <span>{day.hours}h</span>
                  </div>
                  {/*<Progress value={(day.hours / maxHours) * 100} />*/}
                </div>
              ))}
            </div>
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
                  key={exam.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{exam.subject}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(exam.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Target className="size-4" />
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
