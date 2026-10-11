export function BybitLogo({ className = "h-6", white = true }: { className?: string; white?: boolean }) {
  const color = white ? "#ffffff" : "#0a0e17"
  return (
    <svg
      viewBox="0 0 150 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="ByTradeBit"
    >
      <path
        d="M1 3.5h8.5c4.8 0 7.5 2.2 7.5 5.8 0 2.1-1.1 3.8-3 4.6 2.5.7 3.9 2.5 3.9 4.9 0 3.7-2.9 5.7-7.8 5.7H1V3.5zm8.1 8.1c1.8 0 2.8-.8 2.8-2.2s-1-2.2-2.8-2.2H5.4v4.4h3.7zm.7 8.8c1.9 0 3-.9 3-2.4s-1.1-2.4-3-2.4H5.4v4.8h4.4z"
        fill="#f7a600"
      />
      <text x="24" y="20" fill={color} fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="700" letterSpacing="-0.5">ByTradeBit</text>
      <circle cx="111" cy="5.5" r="2" fill="#f7a600" />
    </svg>
  )
}
