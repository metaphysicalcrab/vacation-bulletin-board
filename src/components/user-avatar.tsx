"use client";

import { cn } from "@/lib/utils";

// Warm-toned palette that works well on dark backgrounds
const AVATAR_COLORS = [
  "#c2875a", // copper (accent)
  "#7c9a5e", // sage green
  "#5a8fc2", // steel blue
  "#c25a8f", // rose
  "#8f5ac2", // purple
  "#5ac2a8", // teal
  "#c2a85a", // gold
  "#5a6bc2", // indigo
];

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-lg",
} as const;

export function UserAvatar({
  userId,
  name,
  size = "md",
  className,
}: {
  userId: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const colorIndex = hashUserId(userId) % AVATAR_COLORS.length;
  const bgColor = AVATAR_COLORS[colorIndex];
  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
