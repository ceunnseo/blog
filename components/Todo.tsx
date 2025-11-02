"use client";

import * as React from "react";
import * as Checkbox from "@radix-ui/react-checkbox";

interface TodoProps {
  id: string;
  children: React.ReactNode;
  checked: boolean; // 데이터로만 제어
}

export function Todo({ id, children, checked }: TodoProps) {
  return (
    <label
      htmlFor={id}
      className="group mb-2 flex cursor-default select-none items-start gap-3"
      // label 클릭해도 토글되지 않도록 포인터 막기
      // (아래 Root에도 pointer-events: none 적용)
    >
      <Checkbox.Root
        id={id}
        checked={checked}
        disabled // 웹에서 상호작용 불가
        tabIndex={-1} // 포커스 안 잡히게
        className={[
          "mt-1 inline-flex h-4 w-4 items-center justify-center rounded",
          "border border-lavender-300",
          "data-[state=checked]:bg-lavender-500 data-[state=checked]:border-lavender-500",
          "pointer-events-none", // 마우스/터치 무시
          "outline-none",
        ].join(" ")}
      >
        <Checkbox.Indicator
          className="leading-none text-white text-xs"
          aria-hidden
        >
          ✓
        </Checkbox.Indicator>
      </Checkbox.Root>

      <span
        className={
          checked
            ? "line-through text-gray-500"
            : "text-gray-700 dark:text-gray-200"
        }
      >
        {children}
      </span>
    </label>
  );
}
