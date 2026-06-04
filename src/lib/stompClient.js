import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL } from "./api.js";

const WS_HTTP_BASE_URL = API_BASE_URL || window.location.origin;

function createClient(onConnect) {
  const token = localStorage.getItem("ttjobs_token");
  const client = new Client({
    webSocketFactory: () => new SockJS(`${WS_HTTP_BASE_URL}/ws`, null, {
      transports: ["websocket", "xhr-streaming", "xhr-polling"]
    }),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 0,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {}
  });

  client.onConnect = () => onConnect(client);
  client.activate();

  return () => {
    if (client.active) {
      client.deactivate();
    }
  };
}

function readJson(message, onMessage) {
  try {
    onMessage(JSON.parse(message.body));
  } catch {
    // REST vẫn là nguồn dữ liệu dự phòng nếu payload realtime không hợp lệ.
  }
}

export function subscribeToConversation(conversationId, onMessage) {
  if (!conversationId || typeof onMessage !== "function") {
    return () => {};
  }

  return createClient((client) => {
    client.subscribe(`/topic/conversations/${conversationId}`, (message) => readJson(message, (payload) => {
      if (payload?.type === "message_created" && payload?.payload) {
        onMessage(payload.payload);
        return;
      }
      onMessage(payload);
    }));
  });
}

export function subscribeToUserConversations(userId, onEvent) {
  if (!userId || typeof onEvent !== "function") {
    return () => {};
  }

  return createClient((client) => {
    client.subscribe(`/topic/users/${userId}/conversations`, (message) => readJson(message, onEvent));
  });
}

export function subscribeToForum(threadIds, onEvent) {
  if (typeof onEvent !== "function") {
    return () => {};
  }

  const ids = [...new Set((threadIds || []).filter(Boolean))];

  return createClient((client) => {
    client.subscribe("/topic/forum/events", (message) => readJson(message, onEvent));

    client.subscribe("/topic/forum/posts", (message) => readJson(message, (payload) => {
      onEvent({ type: "post", payload });
    }));

    ids.forEach((threadId) => {
      client.subscribe(`/topic/forum/posts/${threadId}/likes`, (message) => readJson(message, (payload) => {
        onEvent({ type: "like", payload });
      }));
      client.subscribe(`/topic/forum/posts/${threadId}/comments`, (message) => readJson(message, (payload) => {
        onEvent({ type: "comment", threadId, payload });
      }));
    });
  });
}

export function subscribeToInterviewRoom(roomId, { onSignal, onChat, onReady } = {}) {
  if (!roomId) {
    return () => {};
  }

  return createClient((client) => {
    if (typeof onSignal === "function") {
      client.subscribe(`/topic/interviews/${roomId}/signal`, (message) => readJson(message, onSignal));
    }
    if (typeof onChat === "function") {
      client.subscribe(`/topic/interviews/${roomId}/chat`, (message) => readJson(message, onChat));
    }
    if (typeof onReady === "function") {
      onReady();
    }
  });
}
