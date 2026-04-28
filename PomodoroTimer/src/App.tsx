import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTimer } from "@/hooks/useTimer";
import { useNotification } from "@/hooks/useNotification";
import { TimerDisplay } from "@/components/Timer/TimerDisplay";
import { TimerControls } from "@/components/Timer/TimerControls";
import { TimerSettings } from "@/components/Timer/TimerSettings";
import { TimerAlert } from "@/components/Timer/TimerAlert";
import { StatsPanel } from "@/components/Stats/StatsPanel";
import {
  TimerSettings as TimerSettingsType,
  Stats,
  SessionRecord,
} from "@/types";
import { playNotificationSound } from "@/utils/audio";
import { formatDate } from "@/utils/time";

const DEFAULT_SETTINGS: TimerSettingsType = {
  workDuration: 25,
  breakDuration: 5,
};

const DEFAULT_STATS: Stats = {
  completedPomodoros: 0,
  totalWorkMinutes: 0,
  sessions: [],
};

export default function App() {
  const [settings, setSettings] = useLocalStorage<TimerSettingsType>(
    "pomodoro-settings",
    DEFAULT_SETTINGS,
  );
  const [stats, setStats] = useLocalStorage<Stats>(
    "pomodoro-stats",
    DEFAULT_STATS,
  );
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const { sendNotification, requestPermission } = useNotification();
  const settingsRef = useRef(settings);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const handleTimerComplete = useCallback(
    (mode: "work" | "break") => {
      playNotificationSound();

      if (mode === "work") {
        sendNotification("番茄钟", { body: "工作时间到！休息一下吧。" });
        setAlertMessage("该休息啦！！！");
        setShowAlert(true);

        const newSession: SessionRecord = {
          date: formatDate(new Date()),
          mode: "work",
          duration: settingsRef.current.workDuration,
          completedAt: new Date().toISOString(),
        };

        setStats((prev) => ({
          completedPomodoros: prev.completedPomodoros + 1,
          totalWorkMinutes:
            prev.totalWorkMinutes + settingsRef.current.workDuration,
          sessions: [...prev.sessions, newSession],
        }));
      } else {
        sendNotification("番茄钟", { body: "休息结束！开始工作吧。" });
        setAlertMessage("该工作啦！！！");
        setShowAlert(true);
      }
    },
    [sendNotification, setStats],
  );

  const { mode, status, timeLeft, totalTime, start, pause, reset, setTime } =
    useTimer(settings, handleTimerComplete);

  useEffect(() => {
    const modeText = mode === "work" ? "工作" : "休息";
    const timeText = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;
    document.title = `${timeText} - ${modeText} | 番茄钟`;
  }, [mode, timeLeft]);

  const handleCloseAlert = useCallback(() => setShowAlert(false), []);

  return (
    <div className="min-h-screen bg-pomodoro-bg p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-pomodoro-text">番茄钟</h1>
          <p className="mt-1 text-sm text-pomodoro-muted">专注工作，高效休息</p>
        </header>

        <main className="flex flex-col gap-6">
          <div className="rounded-2xl bg-pomodoro-darkBg p-6 shadow-xl">
            <TimerDisplay
              mode={mode}
              status={status}
              timeLeft={timeLeft}
              totalTime={totalTime}
              onTimeChange={setTime}
            />
            <div className="mt-6">
              <TimerControls
                status={status}
                onStart={start}
                onPause={pause}
                onReset={reset}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <TimerSettings settings={settings} onSave={setSettings} />
            <StatsPanel stats={stats} />
          </div>
        </main>
      </div>

      <TimerAlert
        visible={showAlert}
        message={alertMessage}
        onClose={handleCloseAlert}
      />
    </div>
  );
}
