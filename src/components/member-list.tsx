"use client";

import { useAppStore, useMembers } from "@/lib/store-context";
import { removeMember, setMemberRole, isAdmin } from "@/lib/store";
import { X, Shield, ShieldOff, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function MemberList({
  tripId,
  onClose,
}: {
  tripId: string;
  onClose: () => void;
}) {
  const { store, currentUser } = useAppStore();
  const members = useMembers(tripId);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const userIsAdmin = currentUser ? isAdmin(store, tripId, currentUser.id) : false;

  const sorted = [...members].sort(
    (a, b) => a.joinedAt - b.joinedAt
  );

  function handleToggleRole(memberId: string, currentRole: string) {
    setMemberRole(
      store,
      memberId,
      currentRole === "admin" ? "member" : "admin"
    );
  }

  function handleRemove(memberId: string) {
    removeMember(store, memberId);
    setConfirmRemoveId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xs animate-slide-in-right bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <h2 className="font-semibold">Members</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
            aria-label="Close member list"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <ul className="space-y-2">
            {sorted.map((member) => {
              const isCurrentUser = member.userId === currentUser?.id;
              const isConfirming = confirmRemoveId === member.id;
              const memberRole = member.role;

              return (
                <li
                  key={member.id}
                  className="group flex items-center justify-between rounded-lg border border-border-subtle p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-sm">
                        {member.name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] text-foreground-tertiary">(you)</span>
                      )}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          memberRole === "admin"
                            ? "bg-accent-subtle text-accent"
                            : "bg-surface-active text-foreground-tertiary"
                        )}
                      >
                        {memberRole}
                      </span>
                    </div>
                    <p className="text-[10px] text-foreground-tertiary">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Admin actions */}
                  {userIsAdmin && !isCurrentUser && !isConfirming && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleToggleRole(member.id, memberRole)}
                        className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                        title={memberRole === "admin" ? "Remove admin" : "Make admin"}
                        aria-label={memberRole === "admin" ? "Remove admin" : "Make admin"}
                      >
                        {memberRole === "admin" ? (
                          <ShieldOff className="h-3.5 w-3.5" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmRemoveId(member.id)}
                        className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
                        title="Remove member"
                        aria-label="Remove member"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {isConfirming && (
                    <ConfirmDialog
                      message="Remove?"
                      onConfirm={() => handleRemove(member.id)}
                      onCancel={() => setConfirmRemoveId(null)}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-center text-xs text-foreground-tertiary">
            {sorted.length} member{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
