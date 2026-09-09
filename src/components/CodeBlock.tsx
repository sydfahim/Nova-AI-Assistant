import { useState, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useThemeMode } from '@/contexts/ThemeContext'

interface CodeBlockProps {
  language: string
  code: string
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const theme = useThemeMode()
  const isDark = theme === 'dark'
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [code])

  const style: React.CSSProperties = {
    borderRadius: 0,
    margin: 0,
    fontSize: '0.82rem',
    lineHeight: '1.6',
    background: isDark ? '#0d0d12' : '#f5f5f8',
  }

  return (
    <div
      className="rounded-[10px] overflow-hidden border border-border"
      style={{ background: isDark ? '#0d0d12' : '#f5f5f8' }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-border"
        style={{ background: isDark ? '#111118' : '#eeeef4' }}
      >
        <span className="text-xs font-mono text-muted-fg tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-fg hover:text-foreground transition-colors duration-150 py-0.5 px-1.5 rounded hover:bg-[var(--border-color)]"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={isDark ? vscDarkPlus : oneLight}
        customStyle={style}
        showLineNumbers={code.split('\n').length > 6}
        lineNumberStyle={{ color: isDark ? '#3a3a4a' : '#c0c0d0', fontSize: '0.75rem', minWidth: '2.4rem' }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
