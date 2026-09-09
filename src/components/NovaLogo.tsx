interface NovaLogoProps {
  size?: number
  className?: string
}

export default function NovaLogo({ size = 20, className = '' }: NovaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Nova"
    >
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <line x1="12" y1="2.5" x2="12" y2="8"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12" y2="21.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="2.5" y1="12" x2="8"  y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16"  y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5.9"  y1="5.9"  x2="8.8"  y2="8.8"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      <line x1="15.2" y1="15.2" x2="18.1" y2="18.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      <line x1="18.1" y1="5.9"  x2="15.2" y2="8.8"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      <line x1="8.8"  y1="15.2" x2="5.9"  y2="18.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}
