import { useEffect, useRef } from 'react'
import type { Conversation } from '@/types'
import type { Theme } from '@/types'
import Message from './Message'
import MessageInput from './MessageInput'
import WelcomeScreen from './WelcomeScreen'
import ThemeToggle from './ThemeToggle'

interface ChatAreaProps {
  conversation: Conversation | null
  isStreaming: boolean
  onSendMessage: (content: string) => void
  onStop: () => void
  onRegenerate: () => void
  onNewChat: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
  theme: Theme
  onToggleTheme: () => void
}

export default function ChatArea({
  conversation,
  isStreaming,
  onSendMessage,
  onStop,
  onRegenerate,
  onNewChat,
  onToggleSidebar,
  sidebarOpen,
  theme,
  onToggleTheme,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const messages = conversation?.messages ?? []

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isStreaming])

  // Also scroll during streaming content growth
  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
    }
  })

  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i
    }
    return -1
  })()

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            className="p-2 rounded-lg text-muted-fg hover:text-foreground hover:bg-surface transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="15" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          {conversation && (
            <h1
              className="text-sm font-medium text-foreground truncate max-w-[300px]"
              style={{ letterSpacing: '-0.01em' }}
            >
              {conversation.title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* New chat shortcut */}
          <button
            onClick={onNewChat}
            aria-label="New conversation"
            className="p-2 rounded-lg text-muted-fg hover:text-foreground hover:bg-surface transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestion={onSendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            {messages.map((msg, i) => (
              <Message
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1}
                onRegenerate={
                  i === lastAssistantIdx && !isStreaming ? onRegenerate : undefined
                }
              />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={onSendMessage}
        onStop={onStop}
        isStreaming={isStreaming}
        disabled={false}
      />
    </div>
  )
}
