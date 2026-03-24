"use client";

import { useMemberName } from "@/lib/store-context";

export function AuthorName({
  tripId,
  authorId,
  fallbackName,
  className,
}: {
  tripId: string;
  authorId: string;
  fallbackName?: string;
  className?: string;
}) {
  const name = useMemberName(tripId, authorId, fallbackName);
  return <span className={className}>{name}</span>;
}
