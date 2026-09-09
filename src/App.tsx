import { useEffect, useCallback, useState } from 'react'
import { ThemeContext } from '@/contexts/ThemeContext'
import { useTheme } from '@/hooks/useTheme'
import { useConversations } from '@/hooks/useConversations'
import { useChat } from '@/hooks/useChat'
import type { Message } from '@/types'
import Sidebar from '@/components/Sidebar'
import ChatArea from '@/components/ChatArea'

function usePersistentState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)) } catch { /* ignore */ }
  }, [key, state])
  return [state, setState]
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = usePersistentState('nova-sidebar', true)

  const {
    conversations,
    activeConversation,
    activeId,
    newConversation,
    selectConversation,
    updateMessages,
    deleteConversation,
  } = useConversations()

  // Ensure there's always an active conversation on first load
  useEffect(() => {
    if (conversations.length === 0) newConversation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessagesChange = useCallback(
    (msgs: Message[]) => {
      if (activeId) updateMessages(activeId, msgs)
    },
    [activeId, updateMessages],
  )

  const { isStreaming, sendMessage, stop, regenerate } = useChat({
    conversationId: activeId,
    messages: activeConversation?.messages ?? [],
    onMessagesChange: handleMessagesChange,
  })

  const handleSend = useCallback(
    (content: string) => {
      if (!activeId) newConversation()
      sendMessage(content)
    },
    [activeId, newConversation, sendMessage],
  )

  return (
    <ThemeContext.Provider value={theme}>
      <div className="flex h-full font-sans bg-background text-foreground overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={newConversation}
          onDelete={deleteConversation}
          isOpen={sidebarOpen}
        />
        <ChatArea
          conversation={activeConversation}
          isStreaming={isStreaming}
          onSendMessage={handleSend}
          onStop={stop}
          onRegenerate={regenerate}
          onNewChat={newConversation}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          sidebarOpen={sidebarOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    </ThemeContext.Provider>
  )
}
