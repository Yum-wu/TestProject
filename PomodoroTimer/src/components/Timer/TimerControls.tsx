import { memo } from "react";
import { TimerStatus } from "@/types";

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const TimerControls = memo(function TimerControls({
  status,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  const isRunning = status === "running";

  return (
    <div className="flex items-center justify-center gap-4">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="rounded-xl bg-pomodoro-red px-8 py-3 font-semibold text-white transition-all hover:bg-pomodoro-darkRed active:scale-95"
        >
          {status === "paused" ? "继续" : "开始"}
        </button>
      ) : (
        <button
          onClick={onPause}
          className="rounded-xl bg-pomodoro-card px-8 py-3 font-semibold text-pomodoro-text transition-all hover:bg-pomodoro-card/80 active:scale-95"
        >
          暂停
        </button>
      )}

      <button
        onClick={onReset}
        className="rounded-xl bg-pomodoro-card px-6 py-3 font-semibold text-pomodoro-text transition-all hover:bg-pomodoro-card/80 active:scale-95"
      >
        重置
      </button>
    </div>
  );
});
