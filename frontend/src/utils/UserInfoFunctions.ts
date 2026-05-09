import {
  PomodoroSession,
  RawWeeklyProgressItem,
  WeeklyProgressItem,
} from "@/app/types";

export interface WeeklyProgressResult {
  weeklyProgress: WeeklyProgressItem[];
  studyHours: number;
  pomodoroSessions: number;
}

export const calculateWeeklyProgress = (
  rawWeekly: RawWeeklyProgressItem[],
  weeklyProgress: WeeklyProgressItem[],
) => {
  if (rawWeekly.length > 0) {
    const mapByDate = new Map(
      rawWeekly.map((r: RawWeeklyProgressItem) => [
        String(r.date),
        Number(r.totalMinutes ?? 0),
      ]),
    );

    const today = new Date();
    const day = today.getDay();
    const diffToMonday = (day + 6) % 7; // 0->Mon
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const weeklyProgressTemp = weeklyProgress.slice();
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const minutes = mapByDate.get(iso) ?? 0;
      weeklyProgressTemp[i].minutes = minutes;
    }
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayMinutes = mapByDate.get(todayIso) ?? 0;

    //TODO: pomodoroSesions should be length of list, not total / 25, fix on backend
    return {
      weeklyProgress: weeklyProgressTemp,
      studyHours: Math.round((todayMinutes / 60) * 10) / 10,
      pomodoroSessions: Math.max(0, Math.round(todayMinutes / 25)),
    };
  }
};

export const calculateTotalProgress = (rawTotal: PomodoroSession[]) => {
  console.log("Raw total progress:", rawTotal);
  const totalMinutes = rawTotal.reduce(
    (sum, item) => sum + (item.durationMinutes ?? 0),
    0,
  );
  return {
    studyHours: Math.round((totalMinutes / 60) * 10) / 10,
    pomodoroSessions: rawTotal.length,
  };
};
