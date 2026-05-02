/**
 * 加载状态组件
 * 居中显示加载动画
 */
export default function Loading() {
  return (
    <div className="loading-overlay">
      <div className="spinner spinner-lg" />
      <span style={{ marginLeft: 'var(--space-base)', color: 'var(--color-gray-500)' }}>
        加载中...
      </span>
    </div>
  );
}
