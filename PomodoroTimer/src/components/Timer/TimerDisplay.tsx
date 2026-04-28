import { useState, useRef, useEffect, memo } from "react";
import { TimerMode, TimerStatus } from "@/types";

interface TimerDisplayProps {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;
  totalTime: number;
  onTimeChange?: (seconds: number) => void;
}

export const TimerDisplay = memo(function TimerDisplay({
  mode,
  status,
  timeLeft,
  totalTime,
  onTimeChange,
}: TimerDisplayProps) {
  const [editingField, setEditingField] = useState<
    "minutes" | "seconds" | null
  >(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const progress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isWork = mode === "work";
  const mainColor = isWork ? "text-pomodoro-red" : "text-pomodoro-green";
  const bgColor = isWork
    ? "stroke-pomodoro-red/20"
    : "stroke-pomodoro-green/20";
  const progressColor = isWork
    ? "stroke-pomodoro-red"
    : "stroke-pomodoro-green";

  const modeText = isWork ? "工作" : "休息";
  const statusText =
    status === "idle" ? "准备" : status === "running" ? "进行中" : "已暂停";

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const handleTimeClick = (field: "minutes" | "seconds") => {
    if (status === "running") return;
    setEditingField(field);
    if (field === "minutes") {
      setEditValue(String(Math.floor(timeLeft / 60)));
    } else {
      setEditValue(String(timeLeft % 60));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setEditValue(value);
  };

  const handleInputBlur = () => {
    if (!editingField) return;

    const numValue = parseInt(editValue, 10);
    if (isNaN(numValue)) {
      setEditingField(null);
      return;
    }

    let newMinutes = Math.floor(timeLeft / 60);
    let newSeconds = timeLeft % 60;

    if (editingField === "minutes") {
      newMinutes = Math.max(0, Math.min(99, numValue));
    } else {
      newSeconds = Math.max(0, Math.min(59, numValue));
    }

    const totalSeconds = newMinutes * 60 + newSeconds;
    if (totalSeconds > 0 && onTimeChange) {
      onTimeChange(totalSeconds);
    }

    setEditingField(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setEditingField(null);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className={`text-lg font-semibold ${mainColor}`}>{modeText}</span>
        <span className="text-sm text-pomodoro-muted">{statusText}</span>
      </div>

      <div className="relative">
        <svg width="280" height="280" className="transform -rotate-90">
          <circle
            cx="140"
            cy="140"
            r="120"
            strokeWidth="8"
            fill="none"
            className={bgColor}
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            strokeWidth="8"
            fill="none"
            className={`${progressColor} transition-all duration-1000 ease-linear`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`font-mono text-6xl font-bold ${mainColor} flex items-center gap-1`}
          >
            {editingField === "minutes" ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-24 bg-transparent text-center outline-none border-b-2 border-pomodoro-red"
                maxLength={2}
              />
            ) : (
              <span
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => handleTimeClick("minutes")}
                title="点击修改分钟"
              >
                {String(minutes).padStart(2, "0")}
              </span>
            )}
            <span>:</span>
            {editingField === "seconds" ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-16 bg-transparent text-center outline-none border-b-2 border-pomodoro-red"
                maxLength={2}
              />
            ) : (
              <span
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => handleTimeClick("seconds")}
                title="点击修改秒数"
              >
                {String(seconds).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>

      {status === "idle" && (
        <p className="text-xs text-pomodoro-muted">点击时间数字可直接修改</p>
      )}
    </div>
  );
});
