export type TimerMode = "work" | "break";
export type TimerStatus = "idle" | "running" | "paused";

export interface TimerSettings {
  workDuration: number;
  breakDuration: number;
}

export interface SessionRecord {
  date: string;
  mode: TimerMode;
  duration: number;
  completedAt: string;
}

export interface Stats {
  completedPomodoros: number;
  totalWorkMinutes: number;
  sessions: SessionRecord[];
}

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;
  totalTime: number;
}
