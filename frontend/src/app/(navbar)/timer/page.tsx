"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/tabs";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import Button from "@/app/components/button";

type TimerMode = "focus" | "short" | "long";
type ApiPomodoroMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

interface PomodoroSession {
  id: string;
  userId: string;
  mode: ApiPomodoroMode;
  durationMinutes: number;
  subject: string | null;
  completed: boolean;
  completedAt: string;
  createdAt: string;
}

const TIMER_DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_TO_API_MODE: Record<TimerMode, ApiPomodoroMode> = {
  focus: "FOCUS",
  short: "SHORT_BREAK",
  long: "LONG_BREAK",
};

const MODE_TO_LABEL: Record<ApiPomodoroMode, string> = {
  FOCUS: "Focus",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
};

const TimerPage = () => {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [apiError, setApiError] = useState("");
  const intervalRef = useRef<number | null>(null);

  const loadSessions = useCallback(async () => {
    let data: PomodoroSession[] = [];
    await axios
      .get<PomodoroSession[]>("/api/timer")
      .then((res) => res.data)
      .then((result) => {
        data = result;
        setSessions(result);
        const today = new Date().toDateString();
        const completedToday = data.filter(
          (session) =>
            session.completed &&
            new Date(session.completedAt).toDateString() === today,
        ).length;

        setSessionsCompleted(completedToday);
        setApiError("");
      })
      .catch(() => {
        setApiError("Unable to load pomodoro sessions.");
      });
  }, []);

  const saveSession = useCallback(
    async (completedMode: TimerMode, durationMinutes: number) => {
      try {
        await axios.post("/api/timer", {
          mode: MODE_TO_API_MODE[completedMode],
          durationMinutes,
          subject:
            completedMode === "focus"
              ? "Focus"
              : completedMode === "short"
                ? "Short Break"
                : "Long Break",
          completed: true,
        });

        setApiError("");
        void loadSessions();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            (error.response?.data as { message?: string })?.message ??
            "Unable to save pomodoro session.";
          setApiError(message);
          return;
        }

        setApiError("Unable to save pomodoro session.");
      }
    },
    [loadSessions],
  );

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const completedMode = mode;
            setIsRunning(false);
            void saveSession(
              completedMode,
              Math.round(TIMER_DURATIONS[completedMode] / 60),
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, saveSession, timeLeft]);

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const elapsedSeconds = TIMER_DURATIONS[mode] - timeLeft;
  const canSaveCurrentSession = elapsedSeconds >= 60;

  const saveCurrentSession = async () => {
    if (!canSaveCurrentSession) {
      return;
    }

    setIsRunning(false);
    const elapsedMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));
    await saveSession(mode, elapsedMinutes);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress =
    ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-3xl mb-2">Pomodoro Timer</h1>
        <p className="text-gray-600">Stay focused and productive</p>
      </div>

      <div className="flex gap-4 lg:flex-row flex-col">
        <Card>
          <CardContent className="p-6 w-sm">
            <Tabs
              value={mode}
              onValueChange={(v) => handleModeChange(v as TimerMode)}
              className="mb-8"
            >
              <TabsList className="grid h-12 w-full grid-cols-3 rounded-2xl border border-slate-200 bg-slate-100 p-1">
                <TabsTrigger
                  value="focus"
                  className="gap-2 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  <Brain className="size-4" />
                  Focus
                </TabsTrigger>
                <TabsTrigger
                  value="short"
                  className="gap-2 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  <Coffee className="size-4" />
                  Short Break
                </TabsTrigger>
                <TabsTrigger
                  value="long"
                  className="gap-2 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  <Coffee className="size-4" />
                  Long Break
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative mx-auto w-80 h-80 mb-8">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                  className={`transition-all ${
                    mode === "focus" ? "text-indigo-600" : "text-green-600"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-mono tabular-nums">
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                  </div>
                  <p className="text-gray-600 mt-2">
                    {mode === "focus"
                      ? "Focus Time"
                      : mode === "short"
                        ? "Short Break"
                        : "Long Break"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 ">
              <div className="flex-1">
                <Button
                  onClick={toggleTimer}
                  style={{ margin: "auto", display: "flex" }}
                >
                  {isRunning ? (
                    <div className="flex  items-center gap-2">
                      <Pause className="size-5" />
                      <p>Pause</p>
                    </div>
                  ) : (
                    <div className="flex  items-center gap-2">
                      <Play className="size-5" />
                      <p>Start</p>
                    </div>
                  )}
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  onClick={resetTimer}
                  style={{ margin: "auto", display: "flex" }}
                >
                  <RotateCcw className="size-5" />
                  <p>Reset</p>
                </Button>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 mt-3">
              <Button
                onClick={() => void saveCurrentSession()}
                disabled={!canSaveCurrentSession}
                style={{ margin: "auto", display: "flex" }}
              >
                <p>Save Session</p>
              </Button>

              <p className="mt-3 text-center text-sm text-gray-500 ">
                Session can be saved after at least 1 minute.
              </p>
            </div>
            {apiError ? (
              <p className="mt-4 text-center text-sm text-red-600">
                {apiError}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sessions Today</p>
                  <p className="text-2xl mt-1">{sessionsCompleted}</p>
                </div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        sessionsCompleted >= 4 || i < sessionsCompleted % 4
                          ? "bg-indigo-600"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Your Recent Sessions</p>
                  <p className="text-2xl mt-1">{sessions.length}</p>
                </div>
              </div>

              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500">No saved sessions yet.</p>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2 grid-cols-1">
                  {sessions.slice(0, 8).map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-800">
                          {MODE_TO_LABEL[session.mode]}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            session.mode === "FOCUS"
                              ? "bg-indigo-100 text-indigo-700"
                              : session.mode === "SHORT_BREAK"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {session.durationMinutes} min
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(session.completedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimerPage;
