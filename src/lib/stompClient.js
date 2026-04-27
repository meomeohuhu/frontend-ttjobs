import { API_BASE_URL } from "./api.js";

const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

function buildFrame(command, headers = {}, body = "") {
  const headerLines = Object.entries(headers)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}:${value}`);
  return `${command}\n${headerLines.join("\n")}\n\n${body}\0`;
}

function parseFrame(rawFrame) {
  const [headerBlock, ...bodyParts] = rawFrame.split("\n\n");
  const lines = headerBlock.split("\n").filter(Boolean);
  const command = lines.shift();
  const headers = {};
  lines.forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex > -1) {
      headers[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1);
    }
  });
  return { command, headers, body: bodyParts.join("\n\n") };
}

export function subscribeToConversation(conversationId, onMessage) {
  if (!conversationId || typeof onMessage !== "function") {
    return () => {};
  }

  const socket = new WebSocket(`${WS_BASE_URL}/ws`);
  const token = localStorage.getItem("ttjobs_token");

  socket.addEventListener("open", () => {
    socket.send(buildFrame("CONNECT", {
      "accept-version": "1.2",
      "heart-beat": "10000,10000",
      Authorization: token ? `Bearer ${token}` : ""
    }));
  });

  socket.addEventListener("message", (event) => {
    String(event.data)
      .split("\0")
      .filter(Boolean)
      .forEach((rawFrame) => {
        const frame = parseFrame(rawFrame);
        if (frame.command === "CONNECTED") {
          socket.send(buildFrame("SUBSCRIBE", {
            id: `conversation-${conversationId}`,
            destination: `/topic/conversations/${conversationId}`
          }));
          return;
        }

        if (frame.command === "MESSAGE" && frame.body) {
          try {
            onMessage(JSON.parse(frame.body));
          } catch {
            // Ignore malformed realtime payloads; REST remains the source of truth.
          }
        }
      });
  });

  return () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(buildFrame("DISCONNECT"));
    }
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  };
}
