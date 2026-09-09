import { useState, useCallback, useRef } from 'react'
import type { Message } from '@/types'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

interface UseChatOptions {
  conversationId: string | null
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
}

export function useChat({ conversationId, messages, onMessagesChange }: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const latestMessages = useRef(messages)
  latestMessages.current = messages

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
    onMessagesChange(
      latestMessages.current.map(m => ({ ...m, isStreaming: false })),
    )
  }, [onMessagesChange])

  const doStream = useCallback(
    async (
      contextMessages: Message[],
      assistantMsgId: string,
      allMessages: Message[],
    ) => {
      setIsStreaming(true)
      abortRef.current = new AbortController()

      const apiPayload = contextMessages
        .filter(m => !m.isStreaming)
        .map(m => ({ role: m.role, content: m.content }))

      let accumulated = ''

      const patch = (content: string, streaming: boolean) => {
        onMessagesChange(
          latestMessages.current.map(m =>
            m.id === assistantMsgId ? { ...m, content, isStreaming: streaming } : m,
          ),
        )
      }

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiPayload }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const err = await res.text().catch(() => String(res.status))
          throw new Error(err)
        }

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const lines = decoder.decode(value, { stream: true }).split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') break
            try {
              const parsed = JSON.parse(raw)
              if (parsed.error) throw new Error(parsed.error)
              if (parsed.content) {
                accumulated += parsed.content
                patch(accumulated, true)
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                throw e
              }
            }
          }
        }

        patch(accumulated, false)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          patch(accumulated || '*(stopped)*', false)
          return
        }
        const msg = err instanceof Error ? err.message : 'An error occurred'
        patch(`*(Error: ${msg})*`, false)
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [onMessagesChange],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || isStreaming || !content.trim()) return

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      }
      const assistantMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      }

      const next = [...messages, userMsg, assistantMsg]
      onMessagesChange(next)
      await doStream([...messages, userMsg], assistantMsg.id, next)
    },
    [conversationId, isStreaming, messages, onMessagesChange, doStream],
  )

  const regenerate = useCallback(async () => {
    if (isStreaming || messages.length === 0) return

    let lastAsstIdx = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') { lastAsstIdx = i; break }
    }
    if (lastAsstIdx === -1) return

    const refreshed: Message = {
      ...messages[lastAsstIdx],
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    }
    const next = [...messages.slice(0, lastAsstIdx), refreshed]
    onMessagesChange(next)

    const context = messages.slice(0, lastAsstIdx).filter(m => m.role !== 'assistant' || !m.isStreaming)
    await doStream(context, refreshed.id, next)
  }, [isStreaming, messages, onMessagesChange, doStream])

  return { isStreaming, sendMessage, stop, regenerate }
}
