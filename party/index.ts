import type { PartyKitServer, PartyKitConnection, PartyKitRoom } from "partykit/server";

type SyncMessage = {
  type: "sync-request" | "sync-response" | "update";
  data: string;
  sender: string;
};

export default {
  onConnect(connection: PartyKitConnection, room: PartyKitRoom) {
    // When a new client connects, ask existing clients to share state
    connection.send(JSON.stringify({ type: "connected", id: connection.id }));

    // Broadcast to other clients that a new peer joined
    room.broadcast(
      JSON.stringify({ type: "peer-joined", id: connection.id }),
      [connection.id]
    );
  },

  onMessage(message: string | ArrayBuffer | ArrayBufferView, connection: PartyKitConnection, room: PartyKitRoom) {
    try {
      const text = typeof message === "string" ? message : new TextDecoder().decode(message as ArrayBuffer);
      const parsed: SyncMessage = JSON.parse(text);

      switch (parsed.type) {
        case "sync-request":
          // New client requesting full state - broadcast to all others
          room.broadcast(
            JSON.stringify({
              type: "sync-request",
              sender: connection.id,
            }),
            [connection.id]
          );
          break;

        case "sync-response":
          // A client responding with full state - forward to requester
          const target = room.getConnection(parsed.sender);
          if (target) {
            target.send(
              JSON.stringify({
                type: "sync-response",
                data: parsed.data,
                sender: connection.id,
              })
            );
          }
          break;

        case "update":
          // Incremental update - broadcast to all other clients
          room.broadcast(
            JSON.stringify({
              type: "update",
              data: parsed.data,
              sender: connection.id,
            }),
            [connection.id]
          );
          break;
      }
    } catch {
      // Ignore malformed messages
    }
  },

  onClose(connection: PartyKitConnection, room: PartyKitRoom) {
    room.broadcast(
      JSON.stringify({ type: "peer-left", id: connection.id }),
      [connection.id]
    );
  },
} satisfies PartyKitServer;
