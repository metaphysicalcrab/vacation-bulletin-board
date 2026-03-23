"use client";

import { createStore, Store } from "tinybase";
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

export function createAppStore(): Store {
  const store = createStore();

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
  });

  return store;
}

// Helper functions for store operations
export function addMessage(
  store: Store,
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
  });
  return id;
}

export function togglePin(store: Store, messageId: string): void {
  const current = store.getCell("messages", messageId, "pinned") as number;
  store.setCell("messages", messageId, "pinned", current === 1 ? 0 : 1);
}

export function addPoll(
  store: Store,
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

export function votePoll(
  store: Store,
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

export function addEvent(
  store: Store,
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

export function createTrip(
  store: Store,
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

export function addMember(
  store: Store,
  tripId: string,
  name: string,
  role: "admin" | "member" = "member"
): string {
  const id = uuidv4();
  store.setRow("members", id, {
    id,
    tripId,
    name,
    role,
    joinedAt: Date.now(),
  });
  return id;
}
