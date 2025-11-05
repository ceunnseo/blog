"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
interface CalloutProps {
  icon?: string;
  children: React.ReactNode;
  id: string;
}

export function Callout({ icon = "💡", children, id }: CalloutProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1">{children}</div>
      </div>
    </Card>
  );
}
