"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface ToggleProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  id: string;
}

export function Toggle({ summary, children, id }: ToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      key={id}
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger className="w-full flex items-center gap-2 p-3 font-medium hover:bg-lavender-50 dark:hover:bg-lavender-950/20 transition-colors group">
        <svg
          className={`w-4 h-4 text-lavender-600 dark:text-lavender-400 transition-transform duration-200 ${
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
        <span className="flex-1 text-left">{summary}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
