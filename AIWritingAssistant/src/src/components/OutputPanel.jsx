import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './OutputPanel.module.css'

export default function OutputPanel({ content, isLoading, error }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>📄 生成结果</h3>
        {content && (
          <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
        )}
      </div>

      <div className={styles.content}>
        {isLoading && !content && (
          <div className={styles.loading}>
            <span className={styles.cursor}></span>
            <span>AI 正在思考...</span>
          </div>
        )}

        {content && (
          <div className={styles.markdown}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>⚠️ {error}</p>
            {content && <p className={styles.partial}>(已保留生成的内容)</p>}
          </div>
        )}

        {!content && !isLoading && !error && (
          <p className={styles.placeholder}>生成的内容将在这里显示...</p>
        )}
      </div>
    </div>
  )
}
