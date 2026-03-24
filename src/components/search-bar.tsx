"use client";

import { Search, X } from "lucide-react";

export function SearchBar({
  query,
  onQueryChange,
  onClose,
  placeholder = "Search...",
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onClose?: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border-subtle bg-surface px-4 py-2">
      <Search className="h-4 w-4 text-foreground-tertiary" />
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary outline-none"
        autoFocus
      />
      {onClose && (
        <button
          onClick={onClose}
          className="text-foreground-tertiary hover:text-foreground-secondary"
          aria-label="Close search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
