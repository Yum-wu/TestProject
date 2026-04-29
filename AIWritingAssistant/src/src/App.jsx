import { useState, useCallback, useEffect, useRef } from 'react'
import { WRITING_MODES, OPTIMIZE_PROMPT, LENGTH_MAP } from './prompts'
import { useStreaming } from './hooks/useStreaming'
import { useHistory } from './hooks/useHistory'
import Sidebar from './components/Sidebar'
import InputPanel from './components/InputPanel'
import OutputPanel from './components/OutputPanel'
import './App.css'

function App() {
  const [optimizedText, setOptimizedText] = useState(null)
  const lastGenerateParamsRef = useRef(null)
  const { content, isLoading, error, sendRequest, stopGeneration } = useStreaming()
  const { records, addRecord, deleteRecord } = useHistory()

  useEffect(() => {
    if (!isLoading && content && lastGenerateParamsRef.current) {
      addRecord({
        ...lastGenerateParamsRef.current,
        output: content,
      })
      lastGenerateParamsRef.current = null
    }
  }, [isLoading, content])

  const handleGenerate = useCallback(({ mode, input, temperature, maxTokens }) => {
    if (isLoading) {
      stopGeneration()
      return
    }

    const systemPrompt = WRITING_MODES[mode].systemPrompt

    lastGenerateParamsRef.current = { mode, input, temperature, length: maxTokens }

    sendRequest({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature,
      maxTokens,
    })
  }, [isLoading, stopGeneration, sendRequest])

  const handleOptimize = useCallback((input) => {
    if (isLoading) return

    setOptimizedText('')

    sendRequest({
      messages: [
        { role: 'system', content: OPTIMIZE_PROMPT },
        { role: 'user', content: input },
      ],
      temperature: 0.5,
      maxTokens: LENGTH_MAP.medium,
      onReplace: (newContent) => {
        setOptimizedText(newContent)
      },
    })
  }, [isLoading, sendRequest])

  const handleSelectRecord = useCallback(() => {
    // We'll handle this in a parent state if needed
  }, [])

  const handleDeleteRecord = useCallback((id) => {
    deleteRecord(id)
  }, [deleteRecord])

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 智能写作助手</h1>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <Sidebar
            records={records}
            onSelect={handleSelectRecord}
            onDelete={handleDeleteRecord}
          />
        </aside>
        <main className="app-main">
          <InputPanel
            onGenerate={handleGenerate}
            onOptimize={handleOptimize}
            isLoading={isLoading}
            optimizedText={optimizedText}
          />
        </main>
        <section className="app-output">
          <OutputPanel
            content={content}
            isLoading={isLoading}
            error={error}
          />
        </section>
      </div>
    </div>
  )
}

export default App
