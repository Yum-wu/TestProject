import { useTodoStore } from "../store/useTodoStore";

function RingProgress({ percent }: { percent: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 88 88">
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="6"
      />
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

export default function StatsOverview() {
  const tasks = useTodoStore((state) => state.tasks);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">总任务数</p>
        <p className="text-3xl font-bold text-gray-800">{total}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">待完成</p>
        <p className="text-3xl font-bold text-orange-500">{pending}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">已完成</p>
        <p className="text-3xl font-bold text-green-500">{completed}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">完成率</p>
          <p className="text-3xl font-bold text-blue-500">{completionRate}%</p>
        </div>
        <div className="relative">
          <RingProgress percent={completionRate} />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-500">
            {completionRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
