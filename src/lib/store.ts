"use client";

import { createMergeableStore, MergeableStore } from "tinybase";
import { v4 as uuidv4 } from "uuid";

export type Trip = {
  id: string;
  name: string;
  code: string;
  createdAt: number;
};

export type Member = {
  id: string;
  tripId: string;
  userId: string;
  name: string;
  role: "admin" | "member";
  joinedAt: number;
};

export type Message = {
  id: string;
  tripId: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: number;
  pinned: number; // 0 or 1 (TinyBase uses primitives)
  editedAt: number;
};

export type Poll = {
  id: string;
  tripId: string;
  authorId: string;
  authorName: string;
  question: string;
  options: string; // JSON stringified array
  closesAt: number;
  createdAt: number;
  closed: number; // 0 or 1
};

export type PollVote = {
  id: string;
  pollId: string;
  memberId: string;
  memberName: string;
  optionIndex: number;
};

export type ItineraryEvent = {
  id: string;
  tripId: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  location: string;
  createdAt: number;
};

export function createAppStore(): MergeableStore {
  const store = createMergeableStore();

  store.setTablesSchema({
    trips: {
      id: { type: "string" },
      name: { type: "string" },
      code: { type: "string" },
      createdAt: { type: "number" },
    },
    members: {
      id: { type: "string" },
      tripId: { type: "string" },
      userId: { type: "string" },
      name: { type: "string" },
      role: { type: "string", default: "member" },
      joinedAt: { type: "number" },
    },
    messages: {
      id: { type: "string" },
      tripId: { type: "string" },
      authorId: { type: "string" },
      authorName: { type: "string" },
      text: { type: "string" },
      timestamp: { type: "number" },
      pinned: { type: "number", default: 0 },
      editedAt: { type: "number", default: 0 },
    },
    polls: {
      id: { type: "string" },
      tripId: { type: "string" },
      authorId: { type: "string" },
      authorName: { type: "string" },
      question: { type: "string" },
      options: { type: "string" },
      closesAt: { type: "number" },
      createdAt: { type: "number" },
      closed: { type: "number", default: 0 },
    },
    pollVotes: {
      id: { type: "string" },
      pollId: { type: "string" },
      memberId: { type: "string" },
      memberName: { type: "string" },
      optionIndex: { type: "number" },
    },
    events: {
      id: { type: "string" },
      tripId: { type: "string" },
      authorId: { type: "string" },
      authorName: { type: "string" },
      title: { type: "string" },
      description: { type: "string", default: "" },
      startTime: { type: "number" },
      endTime: { type: "number" },
      location: { type: "string", default: "" },
      createdAt: { type: "number" },
    },
    readMarkers: {
      id: { type: "string" },
      tripId: { type: "string" },
      userId: { type: "string" },
      tabName: { type: "string" },
      lastReadTimestamp: { type: "number" },
    },
  });

  return store;
}

// --- Identity helpers ---

export function getMemberForTrip(
  store: MergeableStore,
  tripId: string,
  userId: string
): Member | null {
  const members = store.getTable("members");
  for (const row of Object.values(members)) {
    if (row.tripId === tripId && row.userId === userId) return row as unknown as Member;
  }
  return null;
}

export function resolveAuthorName(
  store: MergeableStore,
  tripId: string,
  authorId: string,
  fallbackName?: string
): string {
  const member = getMemberForTrip(store, tripId, authorId);
  if (member) return member.name;
  return fallbackName || "Unknown";
}

export function isAdmin(
  store: MergeableStore,
  tripId: string,
  userId: string
): boolean {
  const member = getMemberForTrip(store, tripId, userId);
  return member?.role === "admin";
}

export function getMemberRole(
  store: MergeableStore,
  tripId: string,
  userId: string
): "admin" | "member" | null {
  const member = getMemberForTrip(store, tripId, userId);
  if (!member) return null;
  return member.role;
}

// --- Trip helpers ---

export function createTrip(
  store: MergeableStore,
  name: string,
  code: string
): string {
  const id = uuidv4();
  store.setRow("trips", id, {
    id,
    name,
    code,
    createdAt: Date.now(),
  });
  return id;
}

// --- Member helpers ---

export function addMember(
  store: MergeableStore,
  tripId: string,
  userId: string,
  name: string,
  role: "admin" | "member" = "member"
): string {
  const id = uuidv4();
  store.setRow("members", id, {
    id,
    tripId,
    userId,
    name,
    role,
    joinedAt: Date.now(),
  });
  return id;
}

export function removeMember(store: MergeableStore, memberId: string): void {
  store.delRow("members", memberId);
}

export function setMemberRole(
  store: MergeableStore,
  memberId: string,
  role: "admin" | "member"
): void {
  store.setCell("members", memberId, "role", role);
}

export function isLastAdmin(
  store: MergeableStore,
  tripId: string
): boolean {
  const members = store.getTable("members");
  const admins = Object.values(members).filter(
    (m) => m.tripId === tripId && m.role === "admin"
  );
  return admins.length <= 1;
}

export function getMemberCount(
  store: MergeableStore,
  tripId: string
): number {
  const members = store.getTable("members");
  return Object.values(members).filter((m) => m.tripId === tripId).length;
}

export function updateMemberName(
  store: MergeableStore,
  memberId: string,
  name: string
): void {
  store.setCell("members", memberId, "name", name);
}

// --- Message helpers ---

export function addMessage(
  store: MergeableStore,
  tripId: string,
  authorId: string,
  authorName: string,
  text: string
): string {
  const id = uuidv4();
  store.setRow("messages", id, {
    id,
    tripId,
    authorId,
    authorName,
    text,
    timestamp: Date.now(),
    pinned: 0,
    editedAt: 0,
  });
  return id;
}

export function updateMessage(
  store: MergeableStore,
  messageId: string,
  text: string
): void {
  store.setCell("messages", messageId, "text", text);
  store.setCell("messages", messageId, "editedAt", Date.now());
}

export function deleteMessage(
  store: MergeableStore,
  messageId: string
): void {
  store.delRow("messages", messageId);
}

export function togglePin(store: MergeableStore, messageId: string): void {
  const current = store.getCell("messages", messageId, "pinned") as number;
  store.setCell("messages", messageId, "pinned", current === 1 ? 0 : 1);
}

// --- Poll helpers ---

export function addPoll(
  store: MergeableStore,
  tripId: string,
  authorId: string,
  authorName: string,
  question: string,
  options: string[]
): string {
  const id = uuidv4();
  store.setRow("polls", id, {
    id,
    tripId,
    authorId,
    authorName,
    question,
    options: JSON.stringify(options),
    closesAt: 0,
    createdAt: Date.now(),
    closed: 0,
  });
  return id;
}

export function closePoll(store: MergeableStore, pollId: string): void {
  store.setCell("polls", pollId, "closed", 1);
}

export function reopenPoll(store: MergeableStore, pollId: string): void {
  store.setCell("polls", pollId, "closed", 0);
}

export function deletePoll(store: MergeableStore, pollId: string): void {
  // Delete associated votes first
  const allVotes = store.getTable("pollVotes");
  for (const [voteId, vote] of Object.entries(allVotes)) {
    if (vote.pollId === pollId) {
      store.delRow("pollVotes", voteId);
    }
  }
  store.delRow("polls", pollId);
}

export function votePoll(
  store: MergeableStore,
  pollId: string,
  memberId: string,
  memberName: string,
  optionIndex: number
): string {
  // Remove existing vote from this member on this poll
  const allVotes = store.getTable("pollVotes");
  for (const [voteId, vote] of Object.entries(allVotes)) {
    if (vote.pollId === pollId && vote.memberId === memberId) {
      store.delRow("pollVotes", voteId);
    }
  }

  const id = uuidv4();
  store.setRow("pollVotes", id, {
    id,
    pollId,
    memberId,
    memberName,
    optionIndex,
  });
  return id;
}

// --- Event helpers ---

export function addEvent(
  store: MergeableStore,
  tripId: string,
  authorId: string,
  authorName: string,
  title: string,
  description: string,
  startTime: number,
  endTime: number,
  location: string
): string {
  const id = uuidv4();
  store.setRow("events", id, {
    id,
    tripId,
    authorId,
    authorName,
    title,
    description,
    startTime,
    endTime,
    location,
    createdAt: Date.now(),
  });
  return id;
}

export function updateEvent(
  store: MergeableStore,
  eventId: string,
  fields: Partial<{
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    location: string;
  }>
): void {
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      store.setCell("events", eventId, key, value);
    }
  }
}

export function deleteEvent(store: MergeableStore, eventId: string): void {
  store.delRow("events", eventId);
}

// --- Read marker helpers ---

export function updateReadMarker(
  store: MergeableStore,
  tripId: string,
  userId: string,
  tabName: string
): void {
  const markers = store.getTable("readMarkers");
  for (const [id, marker] of Object.entries(markers)) {
    if (
      marker.tripId === tripId &&
      marker.userId === userId &&
      marker.tabName === tabName
    ) {
      store.setCell("readMarkers", id, "lastReadTimestamp", Date.now());
      return;
    }
  }
  const id = uuidv4();
  store.setRow("readMarkers", id, {
    id,
    tripId,
    userId,
    tabName,
    lastReadTimestamp: Date.now(),
  });
}

export function getReadMarkerTimestamp(
  store: MergeableStore,
  tripId: string,
  userId: string,
  tabName: string
): number {
  const markers = store.getTable("readMarkers");
  for (const marker of Object.values(markers)) {
    if (
      marker.tripId === tripId &&
      marker.userId === userId &&
      marker.tabName === tabName
    ) {
      return marker.lastReadTimestamp as number;
    }
  }
  return 0;
}
