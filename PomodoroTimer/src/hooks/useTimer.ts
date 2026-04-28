import { useState, useEffect, useRef, useCallback } from "react";
import { TimerMode, TimerStatus, TimerSettings } from "@/types";

interface UseTimerReturn {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;
  totalTime: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
}

export function useTimer(
  settings: TimerSettings,
  onTimerComplete: (mode: TimerMode) => void,
): UseTimerReturn {
  const [mode, setMode] = useState<TimerMode>("work");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [totalTime, setTotalTime] = useState(settings.workDuration * 60);

  const intervalRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const settingsRef = useRef(settings);
  const modeRef = useRef(mode);
  const timeLeftRef = useRef(timeLeft);
  const statusRef = useRef(status);
  const onTimerCompleteRef = useRef(onTimerComplete);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    onTimerCompleteRef.current = onTimerComplete;
  }, [onTimerComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (endTimeRef.current === null) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));

    setTimeLeft(remaining);

    if (remaining <= 0) {
      clearTimer();
      endTimeRef.current = null;
      setStatus("idle");

      const currentMode = modeRef.current;
      const newMode = currentMode === "work" ? "break" : "work";
      const newTime =
        newMode === "work"
          ? settingsRef.current.workDuration * 60
          : settingsRef.current.breakDuration * 60;

      onTimerCompleteRef.current(currentMode);

      setMode(newMode);
      setTimeLeft(newTime);
      setTotalTime(newTime);
    }
  }, [clearTimer]);

  const start = useCallback(() => {
    setStatus("running");
    endTimeRef.current = Date.now() + timeLeftRef.current * 1000;

    clearTimer();
    intervalRef.current = window.setInterval(tick, 1000);
  }, [tick, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    endTimeRef.current = null;
    setStatus("paused");
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    endTimeRef.current = null;
    const newTime =
      modeRef.current === "work"
        ? settingsRef.current.workDuration * 60
        : settingsRef.current.breakDuration * 60;
    setTimeLeft(newTime);
    setTotalTime(newTime);
    setStatus("idle");
  }, [clearTimer]);

  const setTime = useCallback(
    (seconds: number) => {
      const wasRunning = statusRef.current === "running";
      if (wasRunning) {
        clearTimer();
        endTimeRef.current = null;
      }
      setTimeLeft(seconds);
      setTotalTime(seconds);
      setStatus("idle");
    },
    [clearTimer],
  );

  useEffect(() => {
    if (status === "idle") {
      const newTime =
        modeRef.current === "work"
          ? settingsRef.current.workDuration * 60
          : settingsRef.current.breakDuration * 60;
      if (timeLeftRef.current !== newTime) {
        setTimeLeft(newTime);
        setTotalTime(newTime);
      }
    }
  }, [settings, status]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { mode, status, timeLeft, totalTime, start, pause, reset, setTime };
}
