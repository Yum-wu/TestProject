/**
 * 页面内容容器 PageContainer
 * 提供统一的 main 区域 + container 包裹
 */
export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-main">
      <div className="container">{children}</div>
    </main>
  );
}
