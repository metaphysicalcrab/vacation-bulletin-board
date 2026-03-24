"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useMessages } from "@/lib/store-context";
import {
  addMessage,
  togglePin,
  updateMessage,
  deleteMessage,
  isAdmin,
} from "@/lib/store";
import { Send } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { MessageItem } from "@/components/chat/message-item";
import { ChatInput } from "@/components/chat/chat-input";

export default function ChatPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useMessages(tripId);
  const sorted = [...messages].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const filtered = searchQuery
    ? sorted.filter((msg) =>
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sorted;

  const userIsAdmin = currentUser
    ? isAdmin(store, tripId, currentUser.id)
    : false;

  useEffect(() => {
    if (!searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [sorted.length, searchQuery]);

  function handleSend(text: string) {
    if (!currentUser) return;
    addMessage(store, tripId, currentUser.id, currentUser.name, text);
  }

  function handleEdit(messageId: string, text: string) {
    updateMessage(store, messageId, text);
  }

  function handleDelete(messageId: string) {
    deleteMessage(store, messageId);
  }

  function handleTogglePin(messageId: string) {
    togglePin(store, messageId);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      {showSearch && (
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}
          placeholder="Search messages..."
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {filtered.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              {searchQuery ? (
                <p className="text-sm text-foreground-tertiary">
                  No messages match &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
                    <Send className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="mb-1 font-medium text-foreground-secondary">
                    Start the conversation
                  </h3>
                  <p className="max-w-xs text-sm text-foreground-tertiary">
                    Share ideas, links, and plans with your group.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((msg, idx) => {
            const isOwn = msg.authorId === currentUser?.id;
            const prevMsg = idx > 0 ? filtered[idx - 1] : null;
            const isFirstInGroup = !prevMsg || prevMsg.authorId !== msg.authorId;

            return (
              <MessageItem
                key={msg.id}
                msg={msg}
                tripId={tripId}
                isOwn={isOwn}
                isFirstInGroup={isFirstInGroup}
                canEdit={isOwn}
                canDelete={isOwn || userIsAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onToggleSearch={() => setShowSearch(!showSearch)}
      />
    </div>
  );
}
