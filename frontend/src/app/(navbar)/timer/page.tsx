"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../../components/card";
//import { Button } from "../../components/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/tabs";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import Button from "@/app/components/button";

type TimerMode = "focus" | "short" | "long";

const TIMER_DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const TimerPage = () => {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setSessionsCompleted((s) => s + 1);
            // Play notification sound or show notification
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
  }, [isRunning, timeLeft]);

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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress =
    ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-3xl mb-2">Pomodoro Timer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay focused and productive
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <Tabs
            value={mode}
            onValueChange={(v) => handleModeChange(v as TimerMode)}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="focus" className="gap-2">
                <Brain className="size-4" />
                Focus
              </TabsTrigger>
              <TabsTrigger value="short" className="gap-2">
                <Coffee className="size-4" />
                Short Break
              </TabsTrigger>
              <TabsTrigger value="long" className="gap-2">
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
                className="text-gray-200 dark:text-gray-700"
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
                  mode === "focus"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-green-600 dark:text-green-400"
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
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {mode === "focus"
                    ? "Focus Time"
                    : mode === "short"
                      ? "Short Break"
                      : "Long Break"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleTimer}
              className="gap-2 p-3 border rounded-xl"
            >
              {isRunning ? (
                <div className="flex flex-row items-center gap-2">
                  <Pause className="size-5" />
                  <p>Pause</p>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <Play className="size-5" />
                  <p>Start</p>
                </div>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="gap-2 border rounded-xl flex flex-row items-center p-3"
            >
              <RotateCcw className="size-5" />
              <p>Reset</p>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sessions Today
              </p>
              <p className="text-2xl mt-1">{sessionsCompleted}</p>
            </div>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < sessionsCompleted % 4
                      ? "bg-indigo-600 dark:bg-indigo-400"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimerPage;
