"use client";

import { cn } from "@/lib/utils";

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  className,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-foreground-secondary">{message}</span>
      <button
        onClick={onConfirm}
        className="text-xs font-medium text-destructive hover:underline"
      >
        Yes
      </button>
      <button
        onClick={onCancel}
        className="text-xs text-foreground-tertiary hover:underline"
      >
        No
      </button>
    </div>
  );
}
