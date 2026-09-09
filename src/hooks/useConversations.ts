import { useState, useCallback } from 'react'
import type { Conversation, Message } from '@/types'

const STORAGE_KEY = 'nova-conversations'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Conversation[]
    return parsed.map(c => ({
      ...c,
      messages: c.messages.map(m => ({ ...m, isStreaming: false })),
    }))
  } catch {
    return []
  }
}

function save(convs: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
  } catch { /* storage full */ }
}

function deriveTitle(firstContent: string): string {
  const stripped = firstContent.replace(/```[\s\S]*?```/g, '').trim()
  return stripped.length > 52 ? stripped.slice(0, 52) + '…' : stripped || 'New conversation'
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(load)
  const [activeId, setActiveId] = useState<string | null>(() => load()[0]?.id ?? null)

  const activeConversation = conversations.find(c => c.id === activeId) ?? null

  const newConversation = useCallback((): string => {
    const id = uid()
    const conv: Conversation = {
      id,
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations(prev => {
      const updated = [conv, ...prev]
      save(updated)
      return updated
    })
    setActiveId(id)
    return id
  }, [])

  const selectConversation = useCallback((id: string) => setActiveId(id), [])

  const updateMessages = useCallback((convId: string, messages: Message[]) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== convId) return c
        const title =
          c.title === 'New conversation' && messages.length > 0
            ? deriveTitle(messages[0].content)
            : c.title
        return { ...c, messages, title, updatedAt: Date.now() }
      })
      save(updated)
      return updated
    })
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations(prev => {
        const updated = prev.filter(c => c.id !== id)
        save(updated)
        return updated
      })
      setActiveId(prev => {
        if (prev !== id) return prev
        const remaining = conversations.filter(c => c.id !== id)
        return remaining[0]?.id ?? null
      })
    },
    [conversations],
  )

  return {
    conversations,
    activeConversation,
    activeId,
    newConversation,
    selectConversation,
    updateMessages,
    deleteConversation,
  }
}
