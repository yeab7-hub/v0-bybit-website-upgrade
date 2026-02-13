"use client"

import { useState } from "react"

type OrderTab = "open" | "history" | "funds"

export function OpenOrders() {
  const [tab, setTab] = useState<OrderTab>("open")

  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border px-4">
        {(
          [
            { key: "open", label: "Open Orders(0)" },
            { key: "history", label: "Order History" },
            { key: "funds", label: "Funds" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-3 py-2.5 text-xs font-medium ${
              tab === item.key
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        {tab === "open" && (
          <>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mb-3 text-muted-foreground"
            >
              <rect
                x="8"
                y="8"
                width="32"
                height="32"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M16 20h16M16 28h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm text-muted-foreground">No open orders</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your open orders will appear here
            </p>
          </>
        )}
        {tab === "history" && (
          <>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mb-3 text-muted-foreground"
            >
              <circle
                cx="24"
                cy="24"
                r="16"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M24 16v8l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm text-muted-foreground">No order history</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Log in to see your trading history
            </p>
          </>
        )}
        {tab === "funds" && (
          <>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mb-3 text-muted-foreground"
            >
              <rect
                x="6"
                y="14"
                width="36"
                height="24"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="34"
                cy="26"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 14V12a2 2 0 012-2h20a2 2 0 012 2v2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <p className="text-sm text-muted-foreground">No assets found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Deposit or transfer funds to start trading
            </p>
          </>
        )}
      </div>
    </div>
  )
}
