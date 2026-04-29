import styles from './Sidebar.module.css'

export default function Sidebar({ records, onSelect, onDelete }) {
  const formatTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const getModeLabel = (mode) => {
    const labels = {
      continuation: '续写',
      rewrite: '改写',
      expand: '扩展',
      summarize: '总结',
      email: '邮件',
      copywriting: '文案',
    }
    return labels[mode] || mode
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>📚 历史记录</h3>
        {records.length > 0 && (
          <span className={styles.count}>({records.length})</span>
        )}
      </div>

      <div className={styles.list}>
        {records.length === 0 && (
          <p className={styles.empty}>暂无历史记录</p>
        )}

        {records.map((record) => (
          <div key={record.id} className={styles.item}>
            <div
              className={styles.itemContent}
              onClick={() => onSelect(record)}
            >
              <div className={styles.itemHeader}>
                <span className={`${styles.badge} ${styles[`badge-${record.mode}`]}`}>
                  {getModeLabel(record.mode)}
                </span>
                <span className={styles.time}>{formatTime(record.timestamp)}</span>
              </div>
              <p className={styles.itemText}>
                {record.input.substring(0, 30)}{record.input.length > 30 ? '...' : ''}
              </p>
            </div>
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(record.id)
              }}
              title="删除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
