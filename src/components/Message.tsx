import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { Message as MessageType } from '@/types'
import CodeBlock from './CodeBlock'
import NovaLogo from './NovaLogo'

interface MessageProps {
  message: MessageType
  isLast: boolean
  onRegenerate?: () => void
}

const markdownComponents: Components = {
  code({ className, children, ...props }: any) {
    const lang = /language-(\w+)/.exec(className || '')?.[1]
    const code = String(children).replace(/\n$/, '')
    if (lang) {
      return <CodeBlock language={lang} code={code} />
    }
    return (
      <code
        className="font-mono text-[0.84em] bg-muted px-[0.45em] py-[0.15em] rounded-[5px] border border-border"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre({ children }: any) {
    return <>{children}</>
  },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [text])

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-muted-fg hover:text-foreground transition-colors duration-150 py-1 px-2 rounded hover:bg-surface"
      aria-label="Copy message"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

export default function Message({ message, isLast, onRegenerate }: MessageProps) {
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming

  if (isUser) {
    return (
      <div className="flex justify-end px-4 group">
        <div className="max-w-[78%] sm:max-w-[65%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap"
            style={{ background: 'var(--user-bubble)', color: 'var(--foreground)' }}
          >
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 px-4 group items-start">
      {/* Nova avatar */}
      <div
        className="shrink-0 mt-0.5 size-7 rounded-full flex items-center justify-center text-accent-fg"
        style={{ background: 'var(--accent)' }}
      >
        <NovaLogo size={14} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-2">
        <div
          className={`nova-prose text-sm text-foreground ${isStreaming && !message.content ? '' : isStreaming ? 'streaming-cursor' : ''}`}
        >
          {message.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          ) : isStreaming ? (
            <span className="streaming-cursor" />
          ) : null}
        </div>

        {/* Action row — shown when not streaming and is last assistant message */}
        {!isStreaming && isLast && (
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <CopyButton text={message.content} />
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-xs text-muted-fg hover:text-foreground transition-colors duration-150 py-1 px-2 rounded hover:bg-surface"
                aria-label="Regenerate response"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.15" />
                </svg>
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}

        {/* Copy action for non-last messages */}
        {!isStreaming && !isLast && (
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  )
}
