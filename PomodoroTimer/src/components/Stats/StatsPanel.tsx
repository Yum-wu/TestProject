import { memo } from "react";
import { Stats } from "@/types";
import { formatDate, getWeekDates } from "@/utils/time";

interface StatsPanelProps {
  stats: Stats;
}

export const StatsPanel = memo(function StatsPanel({ stats }: StatsPanelProps) {
  const today = formatDate(new Date());
  const weekDates = getWeekDates();

  const todayCount = stats.sessions.filter(
    (s) => s.date === today && s.mode === "work",
  ).length;
  const weekCount = stats.sessions.filter(
    (s) => weekDates.includes(s.date) && s.mode === "work",
  ).length;

  const weekData = weekDates.map((date) => {
    const count = stats.sessions.filter(
      (s) => s.date === date && s.mode === "work",
    ).length;
    return { date, count };
  });

  const maxCount = Math.max(...weekData.map((d) => d.count), 1);

  const dayLabels = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="rounded-xl bg-pomodoro-card p-4">
      <h3 className="mb-3 text-lg font-bold text-pomodoro-text">统计</h3>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-pomodoro-bg p-3 text-center">
          <div className="text-2xl font-bold text-pomodoro-red">
            {todayCount}
          </div>
          <div className="text-xs text-pomodoro-muted">今日</div>
        </div>
        <div className="rounded-lg bg-pomodoro-bg p-3 text-center">
          <div className="text-2xl font-bold text-pomodoro-green">
            {weekCount}
          </div>
          <div className="text-xs text-pomodoro-muted">本周</div>
        </div>
        <div className="rounded-lg bg-pomodoro-bg p-3 text-center">
          <div className="text-2xl font-bold text-pomodoro-text">
            {stats.completedPomodoros}
          </div>
          <div className="text-xs text-pomodoro-muted">总计</div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-pomodoro-text">
          本周趋势
        </h4>
        <div className="flex items-end justify-between gap-1">
          {weekData.map((day, index) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div className="h-16 w-8 flex items-end justify-center bg-pomodoro-bg rounded">
                <div
                  className="w-6 bg-pomodoro-red/80 rounded transition-all"
                  style={{
                    height: `${(day.count / maxCount) * 100}%`,
                    minHeight: day.count > 0 ? "4px" : "0",
                  }}
                />
              </div>
              <span className="text-xs text-pomodoro-muted">
                {dayLabels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-pomodoro-bg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-pomodoro-muted">总工作时间</span>
          <span className="text-pomodoro-text font-semibold">
            {stats.totalWorkMinutes} 分钟
          </span>
        </div>
      </div>
    </div>
  );
});
