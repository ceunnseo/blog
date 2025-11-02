"use client";

import { useState } from "react";

export function Toggle({
  id,
  summary,
  children,
}: {
  id: string;
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button onClick={() => setIsOpen(!isOpen)}>
        <svg
          className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="flex-1">{summary}</span>
      </button>
      {isOpen && <div className="ml-6 mt-1">{children}</div>}
    </div>
  );
}
