import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { subscribeToInterviewRoom } from "../lib/stompClient.js";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

const parsePayload = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const stopStream = (stream) => {
  stream?.getTracks?.().forEach((track) => track.stop());
};

const waitWithTimeout = (promise, timeoutMs = 5000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("Không thể kết nối realtime phòng phỏng vấn")), timeoutMs))
  ]);

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const roomRef = useRef(null);
  const currentUserRef = useRef(null);
  const makingOfferRef = useRef(false);
  const pendingIceRef = useRef([]);
  const remoteConnectedRef = useRef(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState("Đang chuẩn bị phòng");
  const [connectionState, setConnectionState] = useState("new");
  const [error, setError] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  const isRecruiter = String(currentUser?.role || "").toUpperCase() === "RECRUITER";

  const markRemoteConnected = (value) => {
    remoteConnectedRef.current = value;
    setRemoteConnected(value);
  };

  const shouldRetryOffer = (peer) => {
    if (!peer || remoteConnectedRef.current) return false;
    if (peer.signalingState !== "stable" && peer.signalingState !== "have-local-offer") return false;

    const connectionState = peer.connectionState || "new";
    const iceState = peer.iceConnectionState || "new";
    const waitingForFirstHandshake = connectionState === "new" && ["new", "checking"].includes(iceState);
    const connectionNeedsRecovery = ["failed", "disconnected", "closed"].includes(connectionState)
      || ["failed", "disconnected", "closed"].includes(iceState);

    return waitingForFirstHandshake || connectionNeedsRecovery;
  };

  const sendSignal = async (type, payload = "") => {
    await apiRequest(`/api/interviews/${interviewId}/rooms/signal`, {
      method: "POST",
      body: JSON.stringify({
        type,
        payload: typeof payload === "string" ? payload : JSON.stringify(payload)
      })
    });
  };

  const ensureLocalStream = () => {
    if (!localStreamRef.current) {
      localStreamRef.current = new MediaStream();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    return localStreamRef.current;
  };

  const attachLocalTrack = async (kind) => {
    const constraints = kind === "audio" ? { audio: true, video: false } : { audio: false, video: true };
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    const track = kind === "audio" ? mediaStream.getAudioTracks()[0] : mediaStream.getVideoTracks()[0];
    if (!track) {
      stopStream(mediaStream);
      throw new Error(kind === "audio" ? "Không tìm thấy microphone" : "Không tìm thấy camera");
    }

    const localStream = ensureLocalStream();
    localStream.addTrack(track);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play?.().catch(() => {});
    }

    const peer = peerRef.current;
    if (peer) {
      peer.addTrack(track, localStream);
      window.setTimeout(() => makeOffer({ force: true }), 100);
    }
    return track;
  };

  const flushPendingIce = async () => {
    const peer = peerRef.current;
    if (!peer?.remoteDescription) return;
    const pending = pendingIceRef.current.splice(0);
    for (const candidate of pending) {
      await addIceCandidateSafely(candidate);
    }
  };

  const addIceCandidateSafely = async (candidate) => {
    const peer = peerRef.current;
    if (!peer || !candidate) return;
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      // ICE can arrive from an older offer after rollback/retry. Ignore stale candidates.
      if (!["OperationError", "InvalidStateError"].includes(err?.name)) {
        throw err;
      }
    }
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({ iceServers });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ice_candidate", event.candidate).catch(() => {});
      }
    };

    peer.oniceconnectionstatechange = () => {
      setConnectionState(peer.iceConnectionState);
      if (["failed", "disconnected"].includes(peer.iceConnectionState)) {
        setStatus("Kết nối video bị gián đoạn");
      }
    };

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState);
      if (["failed", "disconnected"].includes(peer.connectionState)) {
        setStatus("Kết nối video bị gián đoạn");
      }
      if (peer.connectionState === "connected") {
        setStatus("Đang phỏng vấn");
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play?.().catch(() => {});
      }
      markRemoteConnected(true);
      setStatus("Đã kết nối video");
    };

    return peer;
  };

  const makeOffer = async ({ force = false } = {}) => {
    const peer = peerRef.current;
    if (!peer || makingOfferRef.current) return;
    makingOfferRef.current = true;
    try {
      if (force && peer.signalingState === "have-local-offer") {
        await peer.setLocalDescription({ type: "rollback" });
        pendingIceRef.current = [];
      }
      if (peer.signalingState !== "stable") return;
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await sendSignal("offer", peer.localDescription);
      setStatus("Đang gửi lời mời kết nối");
    } finally {
      makingOfferRef.current = false;
    }
  };

  const handleSignal = async (event) => {
    if (!event || event.actorId === currentUserRef.current?.id) return;
    const peer = peerRef.current;
    if (!peer) return;
    const payload = parsePayload(event.payload);

    try {
      if (event.type === "ready_for_offer") {
        if (String(currentUserRef.current?.role || "").toUpperCase() === "RECRUITER") {
          window.setTimeout(() => makeOffer({ force: true }), 150);
        }
        return;
      }

      if (event.type === "offer" && payload) {
        pendingIceRef.current = [];
        if (peer.signalingState !== "stable") {
          await Promise.all([
            peer.setLocalDescription({ type: "rollback" }),
            peer.setRemoteDescription(new RTCSessionDescription(payload))
          ]);
        } else {
          await peer.setRemoteDescription(new RTCSessionDescription(payload));
        }
        await flushPendingIce();
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await sendSignal("answer", peer.localDescription);
        setStatus("Đang gửi phản hồi kết nối");
      }

      if (event.type === "answer" && payload && peer.signalingState === "have-local-offer") {
        await peer.setRemoteDescription(new RTCSessionDescription(payload));
        await flushPendingIce();
      }

      if (event.type === "ice_candidate" && payload) {
        if (peer.remoteDescription) {
          await addIceCandidateSafely(payload);
        } else {
          pendingIceRef.current.push(payload);
        }
      }
    } catch (err) {
      setError(err.message || "Không thể xử lý tín hiệu phỏng vấn");
    }
  };

  const handleChat = (event) => {
    if (!event) return;

    if (event.type === "chat_message") {
      const payload = parsePayload(event.payload) || {};
      setMessages((prev) => [...prev, {
        id: `${Date.now()}-${prev.length}`,
        mine: event.actorId === currentUserRef.current?.id,
        text: payload.text || String(event.payload || ""),
        createdAt: payload.createdAt || new Date().toISOString()
      }]);
      return;
    }

    if (event.type === "participant_joined") {
      const otherUserJoined = event.actorId !== currentUserRef.current?.id;
      if (otherUserJoined) {
        setStatus("Người còn lại đã vào phòng");
        if (String(currentUserRef.current?.role || "").toUpperCase() === "RECRUITER") {
          window.setTimeout(() => makeOffer(), 300);
        }
      }
    }

    if (event.type === "participant_left" && event.actorId !== currentUserRef.current?.id) {
      markRemoteConnected(false);
      setStatus("Người còn lại đã rời phòng");
    }

    if (event.type === "room_ended") {
      setStatus("Phòng phỏng vấn đã kết thúc");
      setRoom((prev) => prev ? { ...prev, status: "ENDED" } : prev);
    }
  };

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    let offerRetryTimer = null;

    const setup = async () => {
      try {
        const profile = await apiRequest("/api/users/me");
        const createdRoom = await apiRequest(`/api/interviews/${interviewId}/rooms`, { method: "POST" });
        if (!active) return;

        currentUserRef.current = profile;
        roomRef.current = createdRoom;
        setCurrentUser(profile);
        setRoom(createdRoom);

        ensureLocalStream();

        const peer = createPeer();
        peerRef.current = peer;

        let readyRealtime;
        const realtimeReady = new Promise((resolve) => {
          readyRealtime = resolve;
        });
        unsubscribe = subscribeToInterviewRoom(createdRoom.roomId, {
          onSignal: handleSignal,
          onChat: handleChat,
          onReady: readyRealtime
        });
        await waitWithTimeout(realtimeReady);
        if (!active) return;

        const joined = await apiRequest(`/api/interviews/${interviewId}/rooms/join`, { method: "POST" });
        if (!active) return;
        roomRef.current = joined;
        setRoom(joined);
        setStatus("Đang chờ người còn lại");

        if (String(profile?.role || "").toUpperCase() === "RECRUITER") {
          window.setTimeout(() => makeOffer(), 1800);
          offerRetryTimer = window.setInterval(() => {
            const peer = peerRef.current;
            if (shouldRetryOffer(peer)) {
              makeOffer({ force: true });
            }
          }, 3500);
        } else {
          window.setTimeout(() => {
            sendSignal("ready_for_offer", { createdAt: new Date().toISOString() }).catch(() => {});
          }, 250);
        }
      } catch (err) {
        setError(err.message || "Không thể vào phòng phỏng vấn");
        setStatus("Không thể vào phòng");
      }
    };

    setup();

    return () => {
      active = false;
      if (offerRetryTimer) {
        window.clearInterval(offerRetryTimer);
      }
      unsubscribe();
      if (roomRef.current?.status && roomRef.current.status !== "ENDED") {
        apiRequest(`/api/interviews/${interviewId}/rooms/leave`, { method: "POST" }).catch(() => {});
      }
      peerRef.current?.close?.();
      stopStream(localStreamRef.current);
    };
  }, [interviewId]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks?.()[0];
    if (!track) {
      setError("");
      attachLocalTrack("audio")
        .then((newTrack) => setMicOn(newTrack.enabled))
        .catch((err) => setError(err.message || "Không thể bật microphone"));
      return;
    }
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks?.()[0];
    if (!track) {
      setError("");
      attachLocalTrack("video")
        .then((newTrack) => setCameraOn(newTrack.enabled))
        .catch((err) => setError(err.message || "Không thể bật camera"));
      return;
    }
    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  };

  const sendChat = async (event) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    await sendSignal("chat_message", { text, createdAt: new Date().toISOString() });
  };

  const leaveRoom = async () => {
    await apiRequest(`/api/interviews/${interviewId}/rooms/leave`, { method: "POST" }).catch(() => {});
    navigate(-1);
  };

  const endRoom = async () => {
    try {
      const ended = await apiRequest(`/api/interviews/${interviewId}/rooms/end`, { method: "POST" });
      setRoom(ended);
      setStatus("Phòng phỏng vấn đã kết thúc");
      await sendSignal("chat_message", { text: "Phòng phỏng vấn đã kết thúc.", createdAt: new Date().toISOString() }).catch(() => {});
    } catch (err) {
      setError(err.message || "Không thể kết thúc phòng");
    }
  };

  return (
    <main className="interview-room-page">
      <header className="interview-room-header">
        <div>
          <span className="interview-room-kicker">TTJobs Interview</span>
          <h1>Phòng phỏng vấn trực tuyến</h1>
          <p>{status}</p>
          <small className="interview-room-connection">Kết nối: {connectionState}</small>
        </div>
        <div className="interview-room-header-actions">
          <span className={`interview-room-status ${(room?.status || "WAITING").toLowerCase()}`}>
            {room?.status || "WAITING"}
          </span>
          <Link to={isRecruiter ? "/recruiter/interviews" : "/user/interviews"}>Quay lại lịch</Link>
        </div>
      </header>

      {error ? <div className="interview-room-error">{error}</div> : null}

      <section className="interview-room-shell">
        <div className={`interview-video-stage ${remoteConnected ? "has-remote" : ""}`}>
          <video ref={remoteVideoRef} className="interview-remote-video" autoPlay playsInline />
          <div className="interview-waiting-state">
            <strong>{room?.status === "ENDED" ? "Phòng đã kết thúc" : "Đang chờ người còn lại"}</strong>
          </div>
          <div className="interview-local-video-wrap">
            <video ref={localVideoRef} className="interview-local-video" autoPlay playsInline muted />
            <span>{currentUser?.name || "Bạn"}</span>
          </div>
          <div className="interview-toolbar">
            <button type="button" onClick={toggleMic}>{micOn ? "Tắt mic" : "Bật mic"}</button>
            <button type="button" onClick={toggleCamera}>{cameraOn ? "Tắt camera" : "Bật camera"}</button>
            {isRecruiter ? <button type="button" className="danger" onClick={endRoom}>Kết thúc</button> : null}
            <button type="button" className="danger" onClick={leaveRoom}>Rời phòng</button>
          </div>
        </div>

        <aside className="interview-chat-panel">
          <header>
            <h2>Chat trong phòng</h2>
            <span>{messages.length} tin nhắn</span>
          </header>
          <div className="interview-chat-list">
            {messages.length === 0 ? <p>Chưa có tin nhắn.</p> : null}
            {messages.map((message) => (
              <article key={message.id} className={message.mine ? "mine" : ""}>
                <p>{message.text}</p>
                <time>{new Date(message.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</time>
              </article>
            ))}
          </div>
          <form onSubmit={sendChat} className="interview-chat-form">
            <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Nhập tin nhắn..." />
            <button type="submit">Gửi</button>
          </form>
        </aside>
      </section>
    </main>
  );
};

export default InterviewRoom;
