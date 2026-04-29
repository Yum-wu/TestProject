import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ai-writing-history'

function loadRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载历史记录失败:', e)
  }
  return []
}

export function useHistory() {
  const [records, setRecords] = useState(loadRecords)

  const persistRecords = useCallback((newRecords) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))
    } catch (e) {
      console.error('保存历史记录失败:', e)
    }
  }, [])

  const addRecord = useCallback((record) => {
    const newRecord = {
      id: Date.now().toString(),
      mode: record.mode,
      input: record.input,
      output: record.output,
      temperature: record.temperature,
      length: record.length,
      timestamp: new Date().toISOString(),
    }
    setRecords(prev => {
      const updated = [newRecord, ...prev]
      persistRecords(updated)
      return updated
    })
    return newRecord
  }, [persistRecords])

  const deleteRecord = useCallback((id) => {
    setRecords(prev => {
      const updated = prev.filter(r => r.id !== id)
      persistRecords(updated)
      return updated
    })
  }, [persistRecords])

  const clearAll = useCallback(() => {
    setRecords([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { records, addRecord, deleteRecord, clearAll }
}
