import { useState } from 'react'
import type { Conversation } from '@/types'
import NovaLogo from './NovaLogo'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  isOpen: boolean
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function groupConversations(convs: Conversation[]) {
  const today: Conversation[] = []
  const yesterday: Conversation[] = []
  const older: Conversation[] = []
  const now = Date.now()
  const dayMs = 86400000

  for (const c of convs) {
    const diff = now - c.updatedAt
    if (diff < dayMs) today.push(c)
    else if (diff < dayMs * 2) yesterday.push(c)
    else older.push(c)
  }

  return { today, yesterday, older }
}

interface ConvItemProps {
  conv: Conversation
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

function ConvItem({ conv, isActive, onSelect, onDelete }: ConvItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`relative flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors duration-100 ${
        isActive
          ? 'bg-surface text-foreground'
          : 'text-muted-fg hover:text-foreground hover:bg-surface/60'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug truncate">{conv.title}</p>
        <p className="text-[11px] text-muted-fg mt-0.5">{timeAgo(conv.updatedAt)}</p>
      </div>

      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          aria-label="Delete conversation"
          className="shrink-0 p-1 rounded-md hover:bg-muted text-muted-fg hover:text-foreground transition-colors duration-100 mt-0.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, isOpen }: SidebarProps) {
  const { today, yesterday, older } = groupConversations(conversations)

  const renderGroup = (label: string, items: Conversation[]) => {
    if (!items.length) return null
    return (
      <div key={label} className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-fg px-3 mb-1.5">
          {label}
        </p>
        <div className="space-y-0.5">
          {items.map(c => (
            <ConvItem
              key={c.id}
              conv={c}
              isActive={c.id === activeId}
              onSelect={() => onSelect(c.id)}
              onDelete={() => onDelete(c.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <aside
      className={`
        flex flex-col bg-sidebar border-r border-border
        transition-all duration-200 ease-in-out overflow-hidden
        ${isOpen ? 'w-[260px]' : 'w-0'}
      `}
      style={{ minWidth: isOpen ? 260 : 0 }}
    >
      <div className="flex flex-col h-full w-[260px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="text-accent">
            <NovaLogo size={18} />
          </div>
          <span
            className="text-[15px] font-semibold text-foreground tracking-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            Nova
          </span>
        </div>

        {/* New chat */}
        <div className="px-3 mb-4">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border text-muted-fg hover:text-foreground hover:border-[var(--accent)] hover:bg-surface transition-all duration-150 text-sm font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New conversation
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-[12px] text-muted-fg text-center mt-8 px-4">
              Your conversations will appear here
            </p>
          ) : (
            <>
              {renderGroup('Today', today)}
              {renderGroup('Yesterday', yesterday)}
              {renderGroup('Older', older)}
            </>
          )}
        </div>

        {/* Bottom row */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] text-muted-fg">Nova v1.0</p>
        </div>
      </div>
    </aside>
  )
}
