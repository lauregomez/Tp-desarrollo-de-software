interface CourtLinesProps {
  className?: string
}

export default function CourtLines({ className = '' }: CourtLinesProps) {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <rect x="1" y="1" width="398" height="198" />
      <line x1="200" y1="1" x2="200" y2="199" />

      <circle cx="200" cy="100" r="30" />
      <circle cx="200" cy="100" r="2" fill="currentColor" />

      <path d="M 0 25 A 60 60 0 0 1 60 85 L 60 115 A 60 60 0 0 1 0 175" />
      <path d="M 400 25 A 60 60 0 0 0 340 85 L 340 115 A 60 60 0 0 0 400 175" />

      <circle cx="60" cy="100" r="2" fill="currentColor" />
      <circle cx="100" cy="100" r="2" fill="currentColor" />
      <circle cx="340" cy="100" r="2" fill="currentColor" />
      <circle cx="300" cy="100" r="2" fill="currentColor" />

      <line x1="1" y1="85" x2="1" y2="115" strokeWidth={4} />
      <line x1="399" y1="85" x2="399" y2="115" strokeWidth={4} />
    </svg>
  )
}