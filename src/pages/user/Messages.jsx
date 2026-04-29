import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest, downloadApiFile } from "../../lib/api.js";
import { subscribeToConversation } from "../../lib/stompClient.js";

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

const notifyMessagesChanged = () => {
  window.dispatchEvent(new Event("ttjobs:messages-changed"));
};

const MessagesPage = () => {
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

  const getConversationTitle = (conversation, index) => {
    if (!conversation) return `Cuộc trò chuyện ${index + 1}`;
    const date = conversation.lastMessageAt || conversation.createdAt ? new Date(conversation.lastMessageAt || conversation.createdAt) : null;
    const suffix = date && !Number.isNaN(date.getTime()) ? ` • ${date.toLocaleDateString("vi-VN")}` : "";
    return `Cuộc trò chuyện ${index + 1}${suffix}`;
  };

  const filteredApplications = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return applications;
    return applications.filter((item) => {
      const haystack = [item.jobTitle, item.companyName, item.status, item.userName].join(" ").toLowerCase();
      return haystack.includes(value);
    });
  }, [applications, keyword]);

  const filteredConversations = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    const items = conversations.map((conversation, index) => ({ conversation, index }));
    return items.filter(({ conversation, index }) => {
      const title = getConversationTitle(conversation, index).toLowerCase();
      const unreadMatch = activeFilter === "unread" ? Number(conversation.unreadCount || 0) > 0 : true;
      const keywordMatch = !value || title.includes(value);
      return unreadMatch && keywordMatch;
    });
  }, [conversations, keyword, activeFilter]);

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
    return applications.find((application) => String(application.userId) === String(candidateId)) || null;
  }, [selectedConversation, currentUserId, applications]);

  const loadWorkspace = async () => {
    setLoading(true);
    setError("");
    try {
      const [meData, appData, convoData] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/applications/me"),
        apiRequest("/api/conversations")
      ]);
      setCurrentUserId(meData?.id || null);
      setApplications(Array.isArray(appData) ? appData : []);
      setConversations(Array.isArray(convoData) ? convoData : []);
    } catch (err) {
      setError(err.message || "Không thể tải tin nhắn");
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
      // Keep the current list if refresh fails.
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

  const bubbleMessages = messages.map((item) => ({
    ...item,
    mine: currentUserId != null && String(item.senderId) === String(currentUserId)
  }));

  return (
    <div className="messages-page">
      <header className="messages-topbar">
        <Link to="/" className="messages-brand" aria-label="TTJobs trang chủ">
          <span className="messages-brand-mark">
            <MessageIcon />
          </span>
          <span className="messages-brand-copy">
            <strong>TTJobs Connect</strong>
            <small>Beta</small>
          </span>
        </Link>
        <div className="messages-topbar-actions">
          <Link to="/" className="messages-home-link" title="Về trang chủ">
            <HomeIcon />
            <span>Về trang chủ</span>
          </Link>
          <Link to="/user/notifications" className="messages-settings-link" aria-label="Thiết lập thông báo" title="Thiết lập thông báo">
            <BellIcon />
          </Link>
        </div>
      </header>

      <section className="messages-shell">
        <aside className="messages-sidebar">
          <div className="messages-search">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên công ty, tên nhà tuyển dụng,..."
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
            {filteredConversations.length > 0 ? filteredConversations.map(({ conversation, index }) => {
              const active = String(selectedConversationId) === String(conversation.id);
              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`messages-item ${active ? "active" : ""}`}
                  onClick={() => setSelectedConversationId(String(conversation.id))}
                >
                  <div className="messages-avatar">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="messages-item-body">
                    <strong>{getConversationTitle(conversation, index)}</strong>
                    <span>Trao đổi với nhà tuyển dụng</span>
                    <small>
                      {conversation.lastMessagePreview || (conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString("vi-VN") : "Chưa có ngày")}
                      {Number(conversation.unreadCount || 0) > 0 ? ` • ${conversation.unreadCount} chưa đọc` : ""}
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
                    <h2>{selectedApplication ? `${selectedApplication.jobTitle} • ${selectedApplication.companyName}` : getConversationTitle(selectedConversation, conversations.findIndex((item) => String(item.id) === String(selectedConversation.id)))}</h2>
                    <small>{selectedApplication ? `${selectedApplication.status || "Đang xử lý"} • ${selectedApplication.userName || "CV đã nộp"}` : "Tin nhắn giữa bạn và nhà tuyển dụng"}</small>
                  </div>
                  <div className="messages-thread-actions">
                    <Link to="/user/applied" className="messages-secondary-action">Hồ sơ đã ứng tuyển</Link>
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
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
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

        <aside className="messages-right">
          <div className="messages-right-head">
            <strong>Tin tuyển dụng đã ứng tuyển</strong>
            <span>Những công việc bạn đã nộp CV gần đây</span>
          </div>

          <div className="messages-right-list">
            {filteredApplications.length > 0 ? filteredApplications.map((application) => (
              <div key={application.id} className="messages-right-card">
                <div>
                  <strong>{application.jobTitle || "Tin tuyển dụng"}</strong>
                  <p>{application.companyName || "Nhà tuyển dụng"}</p>
                  <small>{application.status || "Đang xử lý"} • {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString("vi-VN") : "Chưa có ngày"}</small>
                </div>
                <Link to={`/jobs/${application.jobId}`} className="messages-secondary-action">Xem tin</Link>
              </div>
            )) : (
              <p className="messages-empty">Bạn chưa ứng tuyển tin nào.</p>
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

export default MessagesPage;
