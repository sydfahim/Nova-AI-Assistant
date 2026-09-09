import NovaLogo from './NovaLogo'

const SUGGESTIONS = [
  { icon: '✦', label: 'Explain quantum entanglement in simple terms' },
  { icon: '✦', label: 'Write a Python script to rename files in bulk' },
  { icon: '✦', label: 'Draft a concise weekly update for my team' },
  { icon: '✦', label: 'Critique the design of my landing page' },
]

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void
}

export default function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 select-none">
      {/* Mark */}
      <div className="mb-6 text-accent">
        <NovaLogo size={40} />
      </div>

      <h1
        className="text-2xl font-semibold tracking-tight text-foreground mb-1"
        style={{ letterSpacing: '-0.03em' }}
      >
        Nova
      </h1>
      <p className="text-sm text-muted-fg mb-12">Your personal AI assistant</p>

      {/* Suggestion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {SUGGESTIONS.map(s => (
          <button
            key={s.label}
            onClick={() => onSuggestion(s.label)}
            className="text-left px-4 py-3.5 rounded-xl border border-border bg-surface hover:border-[var(--accent)] hover:bg-[var(--user-bubble)] transition-all duration-150 group"
          >
            <span className="text-xs text-accent mb-1 block font-mono">{s.icon}</span>
            <span className="text-sm text-foreground leading-snug">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
