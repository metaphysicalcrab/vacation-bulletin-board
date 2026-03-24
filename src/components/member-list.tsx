"use client";

import { useRouter } from "next/navigation";
import { useAppStore, useMembers } from "@/lib/store-context";
import { removeMember, setMemberRole, isAdmin, isLastAdmin } from "@/lib/store";
import { X, Shield, ShieldOff, UserMinus, Pencil, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";

export function MemberList({
  tripId,
  onClose,
}: {
  tripId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { store, currentUser, renameCurrentUser } = useAppStore();
  const members = useMembers(tripId);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);
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

              const isExpanded = expandedMemberId === member.id;

              return (
                <li
                  key={member.id}
                  className={cn(
                    "rounded-lg border border-border-subtle p-3",
                    userIsAdmin && !isCurrentUser && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (userIsAdmin && !isCurrentUser) {
                      setExpandedMemberId(isExpanded ? null : member.id);
                      setConfirmRemoveId(null);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                  <UserAvatar userId={member.userId} name={member.name} size="md" />
                  <div className="min-w-0 flex-1">
                    {isCurrentUser && editingName ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="h-7 text-sm"
                          maxLength={30}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editNameValue.trim()) {
                              renameCurrentUser(editNameValue.trim());
                              setEditingName(false);
                            }
                            if (e.key === "Escape") setEditingName(false);
                          }}
                        />
                        <button
                          onClick={() => {
                            if (editNameValue.trim()) {
                              renameCurrentUser(editNameValue.trim());
                              setEditingName(false);
                            }
                          }}
                          className="rounded p-1 text-accent hover:bg-surface-hover"
                          aria-label="Save name"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingName(false)}
                          className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover"
                          aria-label="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-sm">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <>
                            <span className="text-[10px] text-foreground-tertiary">(you)</span>
                            <button
                              onClick={() => {
                                setEditNameValue(member.name);
                                setEditingName(true);
                              }}
                              className="rounded p-0.5 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                              aria-label="Edit name"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </>
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
                    )}
                    <p className="text-[10px] text-foreground-tertiary">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {isConfirming && (
                    <ConfirmDialog
                      message="Remove?"
                      onConfirm={() => handleRemove(member.id)}
                      onCancel={() => setConfirmRemoveId(null)}
                    />
                  )}
                  </div>

                  {/* Admin actions — tap to expand */}
                  {userIsAdmin && !isCurrentUser && isExpanded && !isConfirming && (
                    <div className="mt-2 flex items-center gap-2 border-t border-border-subtle pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRole(member.id, memberRole);
                        }}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-foreground-secondary hover:bg-surface-hover"
                      >
                        {memberRole === "admin" ? (
                          <><ShieldOff className="h-3.5 w-3.5" /> Remove admin</>
                        ) : (
                          <><Shield className="h-3.5 w-3.5" /> Make admin</>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmRemoveId(member.id);
                        }}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-surface-hover"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-center text-xs text-foreground-tertiary">
            {sorted.length} member{sorted.length !== 1 ? "s" : ""}
          </p>

          {/* Leave trip */}
          {currentUser && (
            <div className="mt-4 border-t border-border-subtle pt-4">
              {confirmLeave ? (
                <div className="space-y-2">
                  <p className="text-xs text-foreground-secondary">
                    Leave this trip? You&apos;ll need the trip code to rejoin.
                  </p>
                  <ConfirmDialog
                    message="Leave trip?"
                    onConfirm={() => {
                      const myMember = members.find(
                        (m) => m.userId === currentUser.id
                      );
                      if (myMember) {
                        removeMember(store, myMember.id);
                      }
                      onClose();
                      router.push("/");
                    }}
                    onCancel={() => setConfirmLeave(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    // Block if sole admin and other members exist
                    if (
                      isAdmin(store, tripId, currentUser.id) &&
                      isLastAdmin(store, tripId) &&
                      members.length > 1
                    ) {
                      alert("You're the only admin. Promote another member before leaving.");
                      return;
                    }
                    setConfirmLeave(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-surface-hover"
                >
                  <LogOut className="h-4 w-4" />
                  Leave trip
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
