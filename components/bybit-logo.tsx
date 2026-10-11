export function BybitLogo({ className = "h-6", white = true }: { className?: string; white?: boolean }) {
  const color = white ? "#ffffff" : "#0a0e17"
  return (
    <svg
      viewBox="0 0 160 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="ByTradeBit"
    >
      <rect x="1" y="4" width="20" height="20" rx="5" fill="#f7a600" />
      <path d="M7 9h7a3 3 0 0 1 1.6 5.5A3.5 3.5 0 0 1 14 21H7V9zm4 5h2a1.2 1.2 0 1 0 0-2.4h-2V14zm0 4h2.5a1.3 1.3 0 1 0 0-2.6H11V18z" fill="#0a0e17" />
      <text x="28" y="20" fill={color} fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="700" letterSpacing="-0.45">ByTradeBit</text>
    </svg>
  )
}
