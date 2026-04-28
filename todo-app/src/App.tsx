import StatsOverview from "./components/StatsOverview";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg
              className="w-9 h-9 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800">Todo Manager</h1>
          </div>
          <p className="text-gray-500 text-center text-sm">
            简洁高效的个人待办事项管理应用
          </p>
        </header>

        <StatsOverview />
        <TaskForm />
        <TaskList />
      </div>
    </div>
  );
}

export default App;
