import { useState, useCallback, useRef } from 'react'

export function useStreaming() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  const onReplaceRef = useRef(null)

  const sendRequest = useCallback(async ({ messages, temperature, maxTokens, onChunk, onReplace }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    // 保存回调引用到 ref 中，避免闭包问题
    onReplaceRef.current = onReplace

    setIsLoading(true)
    setError(null)
    setContent('')

    try {
      // 检查是否已包含完整路径
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      let endpoint

      if (baseUrl.includes('/chat/completions')) {
        endpoint = baseUrl
      } else if (baseUrl.includes('/v4/')) {
        // 智谱 AI v4 路径
        endpoint = baseUrl
      } else if (baseUrl.includes('/v1')) {
        endpoint = `${baseUrl}/chat/completions`
      } else {
        endpoint = `${baseUrl}/v1/chat/completions`
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'glm-4',  // 智谱 AI 模型
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content || ''
              if (delta) {
                if (onReplaceRef.current) {
                  setContent(prev => {
                    const newContent = prev + delta
                    onReplaceRef.current(newContent)
                    return newContent
                  })
                } else {
                  setContent(prev => prev + delta)
                  if (onChunk) onChunk(delta)
                }
              }
            } catch {
              // 忽略无效的 JSON 片段
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || '请求失败，请稍后重试')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
      onReplaceRef.current = null
    }
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  return { content, isLoading, error, sendRequest, stopGeneration }
}
