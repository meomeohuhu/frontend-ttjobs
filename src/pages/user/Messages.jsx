import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";

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

  const getConversationTitle = (conversation, index) => {
    if (!conversation) return `Cuộc trò chuyện ${index + 1}`;
    const date = conversation.lastMessageAt || conversation.createdAt ? new Date(conversation.lastMessageAt || conversation.createdAt) : null;
    const suffix = date && !Number.isNaN(date.getTime()) ? ` · ${date.toLocaleDateString("vi-VN")}` : "";
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
      const unreadMatch = activeFilter === "unread" ? Number(conversation.unreadByOthersCount || 0) > 0 : true;
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

  const bubbleMessages = messages.map((item) => ({
    ...item,
    mine: currentUserId != null && String(item.senderId) === String(currentUserId)
  }));

  return (
    <div className="messages-page">
      <header className="messages-topbar">
        <Link to="/" className="messages-brand" aria-label="TTJobs trang chủ">
          <span className="messages-brand-mark">TT</span>
          <span className="messages-brand-copy">
            <strong>TTJobs Connect</strong>
            <small>Beta</small>
          </span>
        </Link>
        <div className="messages-topbar-actions">
          <Link to="/" className="messages-home-link">Về trang chủ</Link>
          <Link to="/user/notifications" className="messages-settings-link" aria-label="Thiết lập thông báo">⚙</Link>
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
                      {Number(conversation.unreadByOthersCount || 0) > 0 ? ` · ${conversation.unreadByOthersCount} chưa xem` : ""}
                    </small>
                  </div>
                </button>
              );
            }) : (
              <p className="messages-empty">Bạn chưa có cuộc trò chuyện nào...</p>
            )}
          </div>
        </aside>

        <main className="messages-main">
          <div className="messages-banner">
            <span>New way to follow your chance.</span>
            <strong>More engage, more success</strong>
          </div>

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
                    <h2>{selectedApplication ? `${selectedApplication.jobTitle} · ${selectedApplication.companyName}` : getConversationTitle(selectedConversation, conversations.findIndex((item) => String(item.id) === String(selectedConversation.id)))}</h2>
                    <small>{selectedApplication ? `${selectedApplication.status || "Đang xử lý"} · ${selectedApplication.userName || "CV đã nộp"}` : "Tin nhắn giữa bạn và nhà tuyển dụng"}</small>
                  </div>
                  <div className="messages-thread-actions">
                    <Link to="/user/applied" className="messages-secondary-action">Hồ sơ đã ứng tuyển</Link>
                  </div>
                </div>

                <div className="messages-thread">
                  {messagesLoading ? <p className="messages-empty">Đang tải tin nhắn...</p> : null}
                  {!messagesLoading && bubbleMessages.length > 0 ? bubbleMessages.map((item) => (
                    <div key={item.id} className={`messages-bubble ${item.mine ? "mine" : ""}`}>
                      <p>{item.content}</p>
                      {Array.isArray(item.attachments) && item.attachments.length > 0 ? (
                        <div className="messages-attachment-list">
                          {item.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="messages-attachment-link"
                            >
                              {attachment.fileName || "Tệp đính kèm"}
                            </a>
                          ))}
                        </div>
                      ) : null}
                      <small>{new Date(item.createdAt).toLocaleString("vi-VN")}</small>
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
                  <label className="messages-file-button">
                    <input
                      type="file"
                      onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)}
                    />
                    Tệp
                  </label>
                  <button type="submit" className="messages-primary-action">Gửi</button>
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
                  <small>{application.status || "Đang xử lý"} · {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString("vi-VN") : "Chưa có ngày"}</small>
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
