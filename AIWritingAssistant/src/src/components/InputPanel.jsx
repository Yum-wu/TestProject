import { useState, useEffect, useRef } from 'react'
import { WRITING_MODES, LENGTH_MAP } from '../prompts'
import styles from './InputPanel.module.css'

export default function InputPanel({ onGenerate, onOptimize, isLoading, optimizedText }) {
  const [mode, setMode] = useState('continuation')
  const [temperature, setTemperature] = useState(WRITING_MODES.continuation.defaultTemperature)
  const [outputLength, setOutputLength] = useState(WRITING_MODES.continuation.defaultLength)
  const [inputValue, setInputValue] = useState('')
  const optimizedTextRef = useRef(null)

  // 当优化结果返回时，更新输入框内容
  useEffect(() => {
    if (optimizedText !== null && optimizedText !== undefined && optimizedText !== optimizedTextRef.current) {
      optimizedTextRef.current = optimizedText
      setInputValue(optimizedText)
    }
  }, [optimizedText])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setTemperature(WRITING_MODES[newMode].defaultTemperature)
    setOutputLength(WRITING_MODES[newMode].defaultLength)
  }

  const handleGenerate = () => {
    if (!inputValue.trim()) {
      alert('请输入内容')
      return
    }
    onGenerate({
      mode,
      input: inputValue,
      temperature,
      maxTokens: LENGTH_MAP[outputLength],
    })
  }

  const handleOptimize = () => {
    if (!inputValue.trim()) {
      alert('请输入需要优化的内容')
      return
    }
    onOptimize(inputValue)
  }

  return (
    <div className={styles.container}>
      <div className={styles.modeBar}>
        {Object.entries(WRITING_MODES).map(([key, { label }]) => (
          <button
            key={key}
            className={`${styles.modeBtn} ${mode === key ? styles.active : ''}`}
            onClick={() => handleModeChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        className={styles.textarea}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="请输入您的文本内容..."
        rows={10}
      />

      <div className={styles.params}>
        <div className={styles.paramItem}>
          <label>创意度: {temperature.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>
        <div className={styles.paramItem}>
          <label>长度:</label>
          <select
            value={outputLength}
            onChange={(e) => setOutputLength(e.target.value)}
            className={styles.select}
          >
            <option value="short">短 (~200字)</option>
            <option value="medium">中 (~500字)</option>
            <option value="long">长 (~1000字)</option>
            <option value="extended">超长 (~2000字)</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleOptimize}
          disabled={isLoading}
        >
          ✨ 优化提示词
        </button>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleGenerate}
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? '⏹ 停止生成' : '🚀 生成内容'}
        </button>
      </div>
    </div>
  )
}
