"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface CalloutProps {
  icon?: string;
  children: React.ReactNode;
  id: string;
}

export function Callout({ icon = "💡", children, id }: CalloutProps) {
  return (
    <Alert>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
