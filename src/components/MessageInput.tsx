import { useState, useRef, useCallback, useEffect } from 'react'

interface MessageInputProps {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
}

export default function MessageInput({ onSend, onStop, isStreaming, disabled }: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  useEffect(() => { resize() }, [value, resize])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <div className="px-4 pb-5 pt-3">
      <div
        className="max-w-3xl mx-auto rounded-2xl border border-border bg-surface transition-colors duration-150"
        style={{ boxShadow: '0 0 0 1px var(--border-color), 0 4px 24px oklch(0 0 0 / 0.12)' }}
      >
        {/* Textarea row */}
        <div className="flex items-end gap-2 px-4 pt-3 pb-1">
          {/* Attach file (UI only) */}
          <button
            aria-label="Attach file"
            className="shrink-0 mb-1.5 p-1.5 rounded-lg text-muted-fg hover:text-foreground hover:bg-muted transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nova…"
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent outline-none text-sm text-foreground placeholder:text-muted-fg leading-relaxed py-1.5 max-h-[200px] overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
          />

          {/* Voice (UI only) */}
          {!isStreaming && !value.trim() && (
            <button
              aria-label="Voice input"
              className="shrink-0 mb-1.5 p-1.5 rounded-lg text-muted-fg hover:text-foreground hover:bg-muted transition-colors duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}

          {/* Send / Stop */}
          {isStreaming ? (
            <button
              onClick={onStop}
              aria-label="Stop generating"
              className="shrink-0 mb-1.5 size-8 rounded-lg flex items-center justify-center bg-foreground text-background hover:opacity-80 transition-opacity duration-150"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!value.trim() || disabled}
              aria-label="Send message"
              className="shrink-0 mb-1.5 size-8 rounded-lg flex items-center justify-center bg-accent text-accent-fg disabled:opacity-30 hover:opacity-85 transition-opacity duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 pb-2.5 pt-1">
          <p className="text-[11px] text-muted-fg text-center">
            Nova may make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
