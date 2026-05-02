import { useNavigate } from 'react-router-dom';

/**
 * 404 页面
 * 路由匹配失败时展示
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ fontSize: 64, opacity: 0.3 }}>
        &#x1F50D;
      </div>
      <h2 style={{ marginBottom: 'var(--space-base)', color: 'var(--color-gray-700)' }}>
        页面不存在
      </h2>
      <div className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
        您访问的页面可能已被移除或地址有误
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        返回首页
      </button>
    </div>
  );
}
