/**
 * 全局页脚 Footer
 * 简单的版权信息展示
 */
export default function Footer() {
  return (
    <footer
      style={{
        height: 'var(--footer-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid var(--color-gray-200)',
        backgroundColor: 'var(--color-white)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-gray-500)',
      }}
    >
      &copy; 2026 Mini在线商城 - 学习项目
    </footer>
  );
}
