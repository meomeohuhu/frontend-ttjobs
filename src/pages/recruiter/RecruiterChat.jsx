import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest, downloadApiFile } from "../../lib/api.js";
import { subscribeToConversation } from "../../lib/stompClient.js";
import { formatDate, formatNumber, openCvBlob } from "./recruiterUtils.js";

const AttachIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16.5 6.5 9.1 13.9a3 3 0 1 0 4.2 4.2l7.4-7.4a5 5 0 0 0-7.1-7.1l-7.8 7.8a7 7 0 0 0 9.9 9.9l6.4-6.4" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12 20 4l-4 16-5-6-7-2z" />
    <path d="m11 14 9-10" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 14.8a3 3 0 0 1-3 3H8l-5 3V6.2a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
    <path d="M8 9h8" />
    <path d="M8 13h5" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const AttachmentIcon = ({ attachment }) => {
  const fileName = (attachment?.fileName || "").toLowerCase();
  const mimeType = (attachment?.mimeType || "").toLowerCase();
  const isPdf = mimeType.includes("pdf") || fileName.endsWith(".pdf");
  const isDoc = mimeType.includes("word") || fileName.endsWith(".doc") || fileName.endsWith(".docx");
  const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(fileName);

  if (isPdf) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 15h6" />
      </svg>
    );
  }

  if (isDoc) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 16h6" />
      </svg>
    );
  }

  if (isImage) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M20 16l-5-5-4 4-2-2-5 5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16.5 6.5 9.1 13.9a3 3 0 1 0 4.2 4.2l7.4-7.4a5 5 0 0 0-7.1-7.1l-7.8 7.8a7 7 0 0 0 9.9 9.9l6.4-6.4" />
    </svg>
  );
};

const formatDateTime = (value) => {
  if (!value) return "Chưa có thời gian";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thời gian";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const notifyMessagesChanged = () => {
  window.dispatchEvent(new Event("ttjobs:messages-changed"));
};

const RecruiterChat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(searchParams.get("conversationId") || "");
  const [keyword, setKeyword] = useState("");
  const [messageText, setMessageText] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const threadRef = useRef(null);

  const getApplicantDisplayName = (application) => {
    return application?.candidateName || application?.candidateEmail || "Người nộp CV";
  };

  const conversationByCandidateId = useMemo(() => {
    const map = new Map();
    if (currentUserId == null) return map;

    conversations.forEach((conversation) => {
      const memberIds = conversation.memberIds || [];
      const candidateId = memberIds.find((id) => String(id) !== String(currentUserId));
      if (candidateId != null) {
        map.set(String(candidateId), conversation);
      }
    });

    return map;
  }, [conversations, currentUserId]);

  const contactedApplications = useMemo(() => {
    return applications.filter((application) => conversationByCandidateId.has(String(application.candidateId)));
  }, [applications, conversationByCandidateId]);

  const uncontactedApplications = useMemo(() => {
    return applications.filter((application) => !conversationByCandidateId.has(String(application.candidateId)));
  }, [applications, conversationByCandidateId]);

  const filteredContacted = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return contactedApplications.filter((item) => {
      const convo = conversationByCandidateId.get(String(item.candidateId));
      const unreadMatch = activeFilter === "unread" ? Number(convo?.unreadCount || 0) > 0 : true;
      const haystack = [item.candidateName, item.candidateEmail, item.jobTitle, item.companyName, item.status]
        .join(" ")
        .toLowerCase();
      return unreadMatch && (!value || haystack.includes(value));
    });
  }, [contactedApplications, conversationByCandidateId, keyword, activeFilter]);

  const filteredUncontacted = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return uncontactedApplications;
    return uncontactedApplications.filter((item) => {
      const haystack = [item.candidateName, item.candidateEmail, item.jobTitle, item.companyName, item.status]
        .join(" ")
        .toLowerCase();
      return haystack.includes(value);
    });
  }, [uncontactedApplications, keyword]);

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find((conversation) => String(conversation.id) === String(selectedConversationId)) || null;
  }, [conversations, selectedConversationId]);

  const selectedApplication = useMemo(() => {
    if (!selectedConversation) return null;
    const memberIds = selectedConversation.memberIds || [];
    const candidateId = currentUserId == null
      ? memberIds[0]
      : memberIds.find((id) => String(id) !== String(currentUserId)) ?? memberIds[0];

    if (candidateId == null) return null;
    return applications.find((application) => String(application.candidateId) === String(candidateId)) || null;
  }, [selectedConversation, currentUserId, applications]);

  const loadWorkspace = async () => {
    setLoading(true);
    setError("");
    try {
      const [meData, appData, convoData] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/recruiter/applications?size=200"),
        apiRequest("/api/conversations")
      ]);

      setCurrentUserId(meData?.id || null);
      setApplications(Array.isArray(appData) ? appData : []);
      setConversations(Array.isArray(convoData) ? convoData : []);
    } catch (err) {
      setError(err.message || "Không thể tải trò chuyện");
    } finally {
      setLoading(false);
    }
  };

  const refreshConversations = async () => {
    try {
      const convoData = await apiRequest("/api/conversations");
      setConversations(Array.isArray(convoData) ? convoData : []);
      notifyMessagesChanged();
    } catch {
      // Keep current conversations if refresh fails.
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/conversations/${conversationId}/messages?size=80`);
      setMessages(Array.isArray(data) ? data.slice().reverse() : []);
      await refreshConversations();
    } catch (err) {
      setError(err.message || "Không thể tải tin nhắn");
    } finally {
      setMessagesLoading(false);
    }
  };

  const appendRealtimeMessage = (incomingMessage) => {
    if (!incomingMessage?.id) return;
    setMessages((prev) => {
      if (prev.some((item) => String(item.id) === String(incomingMessage.id))) {
        return prev;
      }
      return [...prev, incomingMessage];
    });
    if (selectedConversationId && String(incomingMessage.conversationId) === String(selectedConversationId)) {
      window.setTimeout(() => loadMessages(selectedConversationId), 0);
      return;
    }
    refreshConversations();
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      setSearchParams({ conversationId: selectedConversationId }, { replace: true });
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
      setSearchParams({}, { replace: true });
    }
  }, [selectedConversationId, setSearchParams]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(String(conversations[0].id));
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId && !selectedConversation && conversations.length > 0) {
      setSelectedConversationId(String(conversations[0].id));
    }
  }, [conversations, selectedConversation, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return undefined;
    return subscribeToConversation(selectedConversationId, appendRealtimeMessage);
  }, [selectedConversationId]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    window.requestAnimationFrame(() => {
      thread.scrollTop = thread.scrollHeight;
    });
  }, [messages.length, selectedConversationId, messagesLoading]);

  const openConversation = (application) => {
    const candidateId = application?.candidateId;
    if (candidateId == null) return;
    const existing = conversationByCandidateId.get(String(candidateId));
    if (existing?.id) {
      setSelectedConversationId(String(existing.id));
      return;
    }

    const createConversation = async () => {
      setError("");
      setMessage("");
      try {
        const created = await apiRequest("/api/conversations", {
          method: "POST",
          body: JSON.stringify({ memberIds: [candidateId] })
        });
        await loadWorkspace();
        if (created?.id) {
          setSelectedConversationId(String(created.id));
        }
        setMessage("Đã mở cuộc trò chuyện mới.");
      } catch (err) {
        setError(err.message || "Không thể mở cuộc trò chuyện");
      }
    };

    createConversation();
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!selectedConversationId || (!messageText.trim() && !attachmentFile)) return;
    setMessage("");
    setError("");
    try {
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("content", messageText.trim());
        formData.append("file", attachmentFile);
        await apiRequest(`/api/conversations/${selectedConversationId}/messages/attachments`, {
          method: "POST",
          body: formData
        });
      } else {
        await apiRequest(`/api/conversations/${selectedConversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({ content: messageText.trim(), type: "text" })
        });
      }
      setMessageText("");
      setAttachmentFile(null);
      await loadMessages(selectedConversationId);
      setMessage("Đã gửi tin nhắn.");
    } catch (err) {
      setError(err.message || "Không thể gửi tin nhắn");
    }
  };

  const downloadAttachment = async (attachment) => {
    if (!selectedConversationId || !attachment?.id) return;
    setMessage("");
    setError("");
    try {
      await downloadApiFile(
        `/api/conversations/${selectedConversationId}/attachments/${attachment.id}/download`,
        attachment.fileName || "attachment"
      );
    } catch (err) {
      setError(err.message || "Không thể tải tệp đính kèm");
    }
  };

  const handleOpenCv = async () => {
    if (!selectedApplication?.id) return;
    try {
      await openCvBlob(selectedApplication.id);
    } catch (err) {
      setError(err.message || "Không thể mở CV");
    }
  };

  const bubbleMessages = messages.map((item) => ({
    ...item,
    mine: currentUserId != null && String(item.senderId) === String(currentUserId)
  }));

  return (
    <div className="messages-page recruiter-messages-page">
      <header className="messages-topbar">
        <Link to="/recruiter/dashboard" className="messages-brand" aria-label="Recruiter dashboard">
          <span className="messages-brand-mark">
            <MessageIcon />
          </span>
          <span className="messages-brand-copy">
            <strong>Recruiter Connect</strong>
            <small>Workspace</small>
          </span>
        </Link>
        <div className="messages-topbar-actions">
          <Link to="/recruiter/dashboard" className="messages-home-link" title="Về dashboard">
            <HomeIcon />
            <span>Về dashboard</span>
          </Link>
          <Link to="/recruiter/notifications" className="messages-settings-link" aria-label="Thông báo" title="Thông báo">
            <BellIcon />
          </Link>
        </div>
      </header>

      <section className="messages-shell recruiter-messages-shell">
        <aside className="messages-sidebar">
          <div className="messages-search">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên người nộp CV, công ty,..."
            />
          </div>

          <div className="messages-tabs">
            <button type="button" className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>
              Tất cả
            </button>
            <button type="button" className={activeFilter === "unread" ? "active" : ""} onClick={() => setActiveFilter("unread")}>
              Chưa đọc
            </button>
          </div>

          <div className="messages-list">
            {filteredContacted.length > 0 ? filteredContacted.map((application) => {
              const convo = conversationByCandidateId.get(String(application.candidateId));
              const active = String(selectedConversationId) === String(convo?.id);
              const initial = (application.candidateName || application.candidateEmail || "U").trim().charAt(0).toUpperCase();
              return (
                <button
                  key={application.id}
                  type="button"
                  className={`messages-item ${active ? "active" : ""}`}
                  onClick={() => convo?.id && setSelectedConversationId(String(convo.id))}
                >
                  <div className="messages-avatar">
                    <span>{initial || "U"}</span>
                  </div>
                  <div className="messages-item-body">
                    <strong>{getApplicantDisplayName(application)}</strong>
                    <span>{application.jobTitle || "Job đang ứng tuyển"}</span>
                    <small>
                      {application.companyName || "Công ty"} • {formatDateTime(convo?.lastMessageAt || application.applicationDate)}
                      {Number(convo?.unreadCount || 0) > 0 ? ` • ${convo.unreadCount} chưa đọc` : ""}
                    </small>
                  </div>
                </button>
              );
            }) : (
              <p className="messages-empty">Bạn chưa có cuộc trò chuyện nào...</p>
            )}
          </div>
        </aside>

        <main className="messages-main messages-main-no-banner">
          <div className="messages-main-surface">
            {!selectedConversation ? (
              <div className="messages-empty-state">
                <div className="messages-empty-illustration" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p>Bạn không có cuộc trò chuyện nào...</p>
              </div>
            ) : (
              <>
                <div className="messages-thread-header">
                  <div>
                    <h2>{getApplicantDisplayName(selectedApplication)}</h2>
                    <small>{selectedApplication?.jobTitle || "Job"} • {selectedApplication?.companyName || "Công ty"}</small>
                  </div>
                  <div className="messages-thread-actions">
                    <button type="button" className="messages-secondary-action" onClick={handleOpenCv}>Xem CV</button>
                    <Link
                      to={selectedApplication?.id ? `/recruiter/applications/${selectedApplication.id}` : "/recruiter/applications"}
                      className="messages-secondary-action"
                    >
                      Quản lý hồ sơ
                    </Link>
                  </div>
                </div>

                <div className="messages-thread" ref={threadRef}>
                  {messagesLoading ? <p className="messages-empty">Đang tải tin nhắn...</p> : null}
                  {!messagesLoading && bubbleMessages.length > 0 ? bubbleMessages.map((item, index) => (
                    <div key={item.id} className={`messages-bubble ${item.mine ? "mine" : ""}`}>
                      <p>{item.content}</p>
                      {Array.isArray(item.attachments) && item.attachments.length > 0 ? (
                        <div className="messages-attachment-list">
                          {item.attachments.map((attachment) => (
                            <button
                              key={attachment.id}
                              type="button"
                              className="messages-attachment-link"
                              onClick={() => downloadAttachment(attachment)}
                            >
                              <span className="messages-attachment-icon" aria-hidden="true">
                                <AttachmentIcon attachment={attachment} />
                              </span>
                              <span className="messages-attachment-name">{attachment.fileName || "Tệp đính kèm"}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <small>
                        {formatDateTime(item.createdAt)}
                        {item.mine && index === bubbleMessages.length - 1 ? (
                          Number(selectedConversation?.unreadByOthersCount || 0) > 0 ? " • Chưa xem" : " • Đã xem"
                        ) : ""}
                      </small>
                    </div>
                  )) : null}
                  {!messagesLoading && bubbleMessages.length === 0 ? (
                    <p className="messages-empty">Bạn chưa có tin nhắn nào.</p>
                  ) : null}
                </div>

                <form className="messages-form" onSubmit={sendMessage}>
                  <input
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Nhập tin nhắn..."
                  />
                  <label className="messages-icon-button" aria-label="Tệp đính kèm" title="Tệp đính kèm">
                    <input
                      type="file"
                      onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)}
                    />
                    <AttachIcon />
                  </label>
                  <button type="submit" className="messages-primary-action" aria-label="Gửi tin nhắn" title="Gửi tin nhắn">
                    <SendIcon />
                  </button>
                </form>
                {attachmentFile ? <p className="messages-file-name">Đã chọn: {attachmentFile.name}</p> : null}
              </>
            )}
          </div>
        </main>

        <aside className="messages-right recruiter-other-applicants">
          <div className="messages-right-head">
            <strong>Người ứng tuyển khác</strong>
            <span>Ứng tuyển vào tin tuyển dụng của bạn trong 7 ngày qua</span>
          </div>

          <div className="messages-right-list">
            {filteredUncontacted.length > 0 ? filteredUncontacted.map((application) => (
              <div key={application.id} className="messages-right-card">
                <div>
                  <strong>{getApplicantDisplayName(application)}</strong>
                  <p>{application.jobTitle || "Job đang ứng tuyển"}</p>
                  <small>{application.companyName || "Công ty"} • {formatDate(application.applicationDate)}</small>
                </div>
                <button type="button" className="messages-secondary-action" onClick={() => openConversation(application)}>
                  <MessageIcon />
                  <span>Nhắn tin</span>
                </button>
              </div>
            )) : (
              <p className="messages-empty">Không còn ứng viên chưa liên hệ.</p>
            )}
          </div>
        </aside>
      </section>

      {loading ? <p className="messages-global-state">Đang tải trò chuyện...</p> : null}
      {!loading && error ? <p className="messages-global-state error">{error}</p> : null}
      {message ? <p className="messages-global-state success">{message}</p> : null}
    </div>
  );
};

export default RecruiterChat;
