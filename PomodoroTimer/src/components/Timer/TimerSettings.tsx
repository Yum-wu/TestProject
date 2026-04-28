import { memo, useCallback } from "react";
import type { TimerSettings as TimerSettingsType } from "@/types";

interface TimerSettingsProps {
  settings: TimerSettingsType;
  onSave: (settings: TimerSettingsType) => void;
}

export const TimerSettings = memo(function TimerSettings({
  settings,
  onSave,
}: TimerSettingsProps) {
  const handleSave = useCallback(() => {
    const work = Math.min(60, Math.max(1, settings.workDuration));
    const rest = Math.min(60, Math.max(1, settings.breakDuration));
    onSave({ workDuration: work, breakDuration: rest });
  }, [settings, onSave]);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-pomodoro-card p-4">
      <h3 className="text-sm font-semibold text-pomodoro-text">时长设置</h3>

      <div className="flex items-center justify-between">
        <label className="text-sm text-pomodoro-muted">工作时长 (分钟)</label>
        <input
          type="number"
          value={settings.workDuration}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            onSave({
              ...settings,
              workDuration: Math.min(60, Math.max(1, val)),
            });
          }}
          min={1}
          max={60}
          className="w-20 rounded-lg bg-pomodoro-bg px-3 py-2 text-center text-pomodoro-text"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm text-pomodoro-muted">休息时长 (分钟)</label>
        <input
          type="number"
          value={settings.breakDuration}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            onSave({
              ...settings,
              breakDuration: Math.min(60, Math.max(1, val)),
            });
          }}
          min={1}
          max={60}
          className="w-20 rounded-lg bg-pomodoro-bg px-3 py-2 text-center text-pomodoro-text"
        />
      </div>

      <button
        onClick={handleSave}
        className="rounded-lg bg-pomodoro-green px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-pomodoro-darkGreen active:scale-95"
      >
        保存设置
      </button>
    </div>
  );
});
