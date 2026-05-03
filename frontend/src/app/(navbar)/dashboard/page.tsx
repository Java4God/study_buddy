import {
  Timer,
  Users,
  Layers,
  TrendingUp,
  Target,
  Calendar,
  Sparkles,
} from "lucide-react";

import { cookies, headers } from "next/headers";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/card";

interface Exam {
  id: string | number | null;
  subjectName: string;
  examDate: string;
  examTime: string;
  location?: string;
  notes?: string;
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  const exam = new Date(y, m - 1, d);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

async function getUpcomingExams(): Promise<Exam[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const host = (await headers()).get("host");

  if (!host) {
    return [];
  }

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  try {
    const response = await fetch(`${protocol}://${host}/api/exam/next`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.map((exam) => ({
      id: exam.id ?? null,
      subjectName: exam.subjectName ?? "Unnamed exam",
      examDate: exam.examDate ?? "",
      examTime: exam.examTime ?? "",
      location: exam.location ?? undefined,
      notes: exam.notes ?? undefined,
    }));
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
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

  const upcomingExams = await getUpcomingExams();

  const weeklyProgress = [
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ];

  // fetch real weekly totals
  const rawWeekly = await (async () => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join("; ");
      const host = (await headers()).get("host");
      if (!host) return [];
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const res = await fetch(`${protocol}://${host}/api/timer/week`, {
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
        cache: "no-store",
      });
      if (!res.ok) return [];
      const payload = await res.json();
      return Array.isArray(payload) ? payload : [];
    } catch {
      return [];
    }
  })();

  // map rawWeekly (date, totalMinutes) into weeklyProgress
  if (Array.isArray(rawWeekly) && rawWeekly.length > 0) {
    const mapByDate = new Map(
      rawWeekly.map((r: any) => [String(r.date), Number(r.totalMinutes ?? 0)]),
    );

    const today = new Date();
    // ISO week starting Monday
    const day = today.getDay();
    const diffToMonday = (day + 6) % 7; // 0->Mon
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const minutes = mapByDate.get(iso) ?? 0;
      weeklyProgress[i].hours = Math.round((minutes / 60) * 10) / 10;
    }

    // update today's stats
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayMinutes = mapByDate.get(todayIso) ?? 0;
    todayStats["Study Hours"] = Math.round((todayMinutes / 60) * 10) / 10;
    // approximate pomodoro sessions by 25-minute blocks
    todayStats["Pomodoro Sessions"] = Math.max(0, Math.round(todayMinutes / 25));
  }

  return (
    <div className="w-full bg-switch-background/20">
      <div className="space-y-6 py-8 px-20 w-7xl">
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
