import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import { formatDate, formatNumber, openCvBlob } from "./recruiterUtils.js";

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
      const unreadMatch = activeFilter === "unread" ? Number(convo?.unreadByOthersCount || 0) > 0 : true;
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
          <span className="messages-brand-mark">TT</span>
          <span className="messages-brand-copy">
            <strong>Recruiter Connect</strong>
            <small>Workspace</small>
          </span>
        </Link>
        <div className="messages-topbar-actions">
          <Link to="/recruiter/dashboard" className="messages-home-link">Về dashboard</Link>
          <Link to="/recruiter/notifications" className="messages-settings-link" aria-label="Thông báo">⚙</Link>
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
                      {application.companyName || "Công ty"} · {formatDate(application.applicationDate)}
                      {Number(convo?.unreadByOthersCount || 0) > 0 ? ` · ${convo.unreadByOthersCount} chưa xem` : ""}
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
                    <h2>{getApplicantDisplayName(selectedApplication)}</h2>
                    <small>{selectedApplication?.jobTitle || "Job"} · {selectedApplication?.companyName || "Công ty"}</small>
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
                      <small>{formatDate(item.createdAt)}</small>
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
            <strong>Người ứng tuyển khác</strong>
            <span>Ứng tuyển vào tin tuyển dụng của bạn trong 7 ngày qua</span>
          </div>

          <div className="messages-right-list">
            {filteredUncontacted.length > 0 ? filteredUncontacted.map((application) => (
              <div key={application.id} className="messages-right-card">
                <div>
                  <strong>{getApplicantDisplayName(application)}</strong>
                  <p>{application.jobTitle || "Job đang ứng tuyển"}</p>
                  <small>{application.companyName || "Công ty"} · {formatDate(application.applicationDate)}</small>
                </div>
                <button type="button" className="messages-secondary-action" onClick={() => openConversation(application)}>
                  Nhắn tin
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
