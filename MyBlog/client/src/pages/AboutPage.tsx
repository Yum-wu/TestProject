/**
 * 关于页面
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        关于我
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          你好！我是 <strong>Yum</strong>，一名全栈开发者。
        </p>

        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          这个博客是我记录技术成长、分享编程心得的地方。我主要关注前端开发（React、TypeScript）、
          后端架构（Node.js）以及开发者工具链。
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-8">
          技术栈
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            "React / Next.js",
            "TypeScript",
            "Vite",
            "Node.js",
            "Tailwind CSS",
            "Git",
          ].map((tech) => (
            <div
              key={tech}
              className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800"
            >
              {tech}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-8">
          联系我
        </h2>
        <ul className="text-neutral-600 dark:text-neutral-400 space-y-2">
          <li>
            GitHub：{" "}
            <a
              href="https://github.com/Yum-wu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              @Yum-wu
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
