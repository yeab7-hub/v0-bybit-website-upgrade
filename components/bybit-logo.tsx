export function BybitLogo({ className = "h-6", white = true }: { className?: string; white?: boolean }) {
  // Official Bybit wordmark rendered as SVG text for crisp rendering at all sizes
  const color = white ? "#ffffff" : "#0a0e17"
  return (
    <svg
      viewBox="0 0 120 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bybit"
    >
      {/* B */}
      <path
        d="M0 3.5h9.6c2.1 0 3.8.5 4.9 1.5 1 .9 1.5 2.1 1.5 3.5 0 1.8-.9 3.1-2.6 3.9v.1c2.2.6 3.3 2.2 3.3 4.3 0 1.6-.6 2.9-1.8 3.9-1.2 1-2.8 1.5-4.9 1.5H0V3.5zm9.1 7.8c1.6 0 2.5-.8 2.5-2.1 0-1.3-.9-2-2.5-2H4.5v4.1h4.6zm.5 8.4c1.7 0 2.7-.9 2.7-2.3 0-1.4-1-2.3-2.7-2.3H4.5v4.6h5.1z"
        fill={color}
      />
      {/* Y */}
      <path
        d="M22.5 14.8L17 3.5h5l3.5 7.7 3.5-7.7h4.8l-5.5 11.3v7h-4.6v-7z"
        fill={color}
      />
      {/* B */}
      <path
        d="M36 3.5h9.6c2.1 0 3.8.5 4.9 1.5 1 .9 1.5 2.1 1.5 3.5 0 1.8-.9 3.1-2.6 3.9v.1c2.2.6 3.3 2.2 3.3 4.3 0 1.6-.6 2.9-1.8 3.9-1.2 1-2.8 1.5-4.9 1.5H36V3.5zm9.1 7.8c1.6 0 2.5-.8 2.5-2.1 0-1.3-.9-2-2.5-2h-4.6v4.1h4.6zm.5 8.4c1.7 0 2.7-.9 2.7-2.3 0-1.4-1-2.3-2.7-2.3h-5.1v4.6h5.1z"
        fill={color}
      />
      {/* I */}
      <path d="M56 3.5h4.6v18.7H56V3.5z" fill={color} />
      {/* T */}
      <path
        d="M64 3.5h16v3.8h-5.7v14.9h-4.6V7.3H64V3.5z"
        fill={color}
      />
      {/* Bybit dot accent */}
      <rect x="82" y="3.5" width="4" height="4" rx="2" fill="#f7a600" />
    </svg>
  )
}
