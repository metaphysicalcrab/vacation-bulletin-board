import { WebSocketServer } from "ws";
import { createWsServer } from "tinybase/synchronizers/synchronizer-ws-server";

const port = process.env.PORT || 8048;
const wss = new WebSocketServer({ port });
const server = createWsServer(wss);

server.addPathIdsListener(null, (_server, pathId, addedOrRemoved) => {
  const action = addedOrRemoved === 1 ? "opened" : "closed";
  console.log(`Room ${action}: ${pathId}`);
});

server.addClientIdsListener(null, (_server, pathId, clientId, addedOrRemoved) => {
  const action = addedOrRemoved === 1 ? "joined" : "left";
  console.log(`Client ${clientId} ${action} room: ${pathId}`);
});

console.log(`Voyage Board sync server running on ws://localhost:${port}`);
