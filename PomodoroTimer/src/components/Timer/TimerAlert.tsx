import { useState, useEffect, memo } from "react";

interface TimerAlertProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export const TimerAlert = memo(function TimerAlert({
  visible,
  message,
  onClose,
}: TimerAlertProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      window.focus();
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition-all ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pomodoro-red/10">
            <svg
              className="h-8 w-8 text-pomodoro-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
          番茄钟提醒
        </h2>

        <p className="mb-6 text-center text-lg text-gray-600">{message}</p>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-pomodoro-red py-3 font-semibold text-white transition-all hover:bg-pomodoro-darkRed active:scale-95"
          autoFocus
        >
          知道了
        </button>
      </div>
    </div>
  );
});
