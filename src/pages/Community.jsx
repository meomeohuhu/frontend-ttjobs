import { useCallback, useEffect, useMemo, useState } from "react";
import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";
import { apiRequest } from "../lib/api.js";
import { subscribeToForum } from "../lib/stompClient.js";

const topics = [
  { value: "all", label: "Tất cả" },
  { value: "Hỏi đáp", label: "Hỏi đáp" },
  { value: "CV", label: "CV" },
  { value: "Phỏng vấn", label: "Phỏng vấn" },
  { value: "Lương thưởng", label: "Lương thưởng" },
  { value: "Tin tuyển dụng", label: "Tin tuyển dụng" }
];

const fallbackThreads = [
  {
    id: 101,
    author: "Mai Anh",
    role: "Ứng viên",
    title: "CV frontend junior nên để project cá nhân như thế nào?",
    body: "Mình đang chuẩn bị ứng tuyển React intern/junior. Mọi người thường trình bày project cá nhân ra sao để recruiter dễ đánh giá?",
    tag: "CV",
    hashtags: ["#React", "#CV", "#Junior"],
    likes: 18,
    commentCount: 1,
    comments: [
      { id: 1, author: "Quang Huy", body: "Nên có link demo, GitHub và 2-3 gạch đầu dòng về impact/kỹ thuật chính." }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 102,
    author: "TTJobs Recruiter",
    role: "Nhà tuyển dụng",
    title: "Đang tuyển Backend Java tại TP.HCM",
    body: "Team mình cần Java/Spring Boot 1-3 năm kinh nghiệm, hybrid 3 ngày/tuần. Bạn nào quan tâm có thể bình luận để mình gửi JD.",
    tag: "Tin tuyển dụng",
    hashtags: ["#Java", "#SpringBoot", "#HCM"],
    likes: 32,
    commentCount: 2,
    comments: [
      { id: 1, author: "Minh Khoa", body: "Cho mình xin JD với ạ." },
      { id: 2, author: "TTJobs Recruiter", body: "Mình đã gửi thông tin qua tin nhắn." }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  }
];

const actionIcons = {
  like: "M7 10v11H3V10h4Zm4.5 11H18a3 3 0 0 0 2.9-2.25l1.05-5A3 3 0 0 0 19 10h-5.5l.8-3.2A3 3 0 0 0 11.4 3L9 10v11h2.5Z",
  comment: "M21 12a8 8 0 0 1-8 8H8l-5 3 1.7-4.6A8 8 0 1 1 21 12Z",
  share: "M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .17 1L8.9 8.6a3 3 0 1 0 0 4.8l6.27 3.6A3 3 0 1 0 16 15.3l-6.25-3.58a3.2 3.2 0 0 0 0-1.44L16 6.7A3 3 0 0 0 18 8Z",
  flag: "M5 21V4h10l.5 2H20v10h-9.5l-.5-2H7v7H5Z"
};

const ActionIcon = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={actionIcons[name]} />
  </svg>
);

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa xong";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  });
};

const getCommentCount = (thread) => Number(thread.commentCount ?? thread.comments?.length ?? 0);
const hasAuthToken = () => Boolean(localStorage.getItem("ttjobs_token"));
const shouldShowInTopic = (thread, activeTopic) => activeTopic === "all" || thread.tag === activeTopic;

const upsertThread = (threads, nextThread, activeTopic) => {
  if (!nextThread?.id || !shouldShowInTopic(nextThread, activeTopic)) {
    return threads;
  }
  const exists = threads.some((thread) => String(thread.id) === String(nextThread.id));
  if (exists) {
    return threads.map((thread) => (String(thread.id) === String(nextThread.id) ? { ...thread, ...nextThread } : thread));
  }
  return [nextThread, ...threads];
};

const appendComment = (threads, threadId, comment) => threads.map((thread) => {
  if (String(thread.id) !== String(threadId) || !comment?.id) return thread;
  const comments = thread.comments || [];
  if (comments.some((item) => String(item.id) === String(comment.id))) {
    return thread;
  }
  return {
    ...thread,
    comments: [...comments, comment],
    commentCount: getCommentCount(thread) + 1
  };
});

const patchComment = (threads, comment) => threads.map((thread) => {
  if (String(thread.id) !== String(comment?.postId)) return thread;
  return {
    ...thread,
    comments: (thread.comments || []).map((item) => (String(item.id) === String(comment.id) ? { ...item, ...comment } : item))
  };
});

const removeThread = (threads, threadId) => threads.filter((thread) => String(thread.id) !== String(threadId));

const removeComment = (threads, threadId, commentId) => threads.map((thread) => {
  if (String(thread.id) !== String(threadId)) return thread;
  return {
    ...thread,
    comments: (thread.comments || []).filter((comment) => String(comment.id) !== String(commentId)),
    commentCount: Math.max(0, getCommentCount(thread) - 1)
  };
});

const Community = () => {
  const [threads, setThreads] = useState([]);
  const [activeTopic, setActiveTopic] = useState("all");
  const [activeHashtag, setActiveHashtag] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [canUseRealtime, setCanUseRealtime] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [reportDialog, setReportDialog] = useState(null);
  const [highlightedPostId, setHighlightedPostId] = useState("");
  const [highlightedCommentId, setHighlightedCommentId] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState("");
  const [form, setForm] = useState({
    title: "",
    body: "",
    tag: "Hỏi đáp"
  });

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    const query = new URLSearchParams({ size: "50" });
    if (activeTopic !== "all") {
      query.set("tag", activeTopic);
    }

    try {
      const data = await apiRequest(`/api/forum/posts?${query.toString()}`);
      setThreads(Array.isArray(data) ? data : []);
      setError("");
      setCanUseRealtime(true);
    } catch {
      setError("Chưa kết nối được backend forum. Đang hiển thị dữ liệu mẫu.");
      setThreads((current) => (current.length ? current : fallbackThreads));
      setCanUseRealtime(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeTopic]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (!window.location.hash.startsWith("#post-")) return undefined;
    const postId = window.location.hash.replace("#post-", "");
    if (!postId || isLoading) return undefined;

    const existing = threads.some((thread) => String(thread.id) === String(postId));
    if (!existing && canUseRealtime) {
      apiRequest(`/api/forum/posts/${postId}`)
        .then((post) => {
          setThreads((current) => upsertThread(current, post, "all"));
          setActiveTopic("all");
          setActiveHashtag("");
        })
        .catch(() => showToast("Không tìm thấy bài viết hoặc bài đã bị ẩn.", "error"));
      return undefined;
    }

    const target = document.getElementById(`post-${postId}`);
    if (!target) return undefined;
    setHighlightedPostId(postId);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setHighlightedPostId(""), 3600);
    return () => window.clearTimeout(timer);
  }, [threads, isLoading, canUseRealtime]);

  useEffect(() => {
    if (!window.location.hash.startsWith("#comment-") || isLoading) return undefined;
    const [, postId, commentId] = window.location.hash.match(/^#comment-(\d+)-(\d+)$/) || [];
    if (!postId || !commentId) return undefined;

    const existing = threads.some((thread) => String(thread.id) === String(postId));
    if (!existing && canUseRealtime) {
      apiRequest(`/api/forum/posts/${postId}`)
        .then((post) => {
          setThreads((current) => upsertThread(current, post, "all"));
          setActiveTopic("all");
          setActiveHashtag("");
        })
        .catch(() => showToast("Không tìm thấy bình luận hoặc bài viết đã bị ẩn.", "error"));
      return undefined;
    }

    const target = document.getElementById(`comment-item-${commentId}`);
    if (!target) return undefined;
    setHighlightedPostId(postId);
    setHighlightedCommentId(commentId);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => {
      setHighlightedPostId("");
      setHighlightedCommentId("");
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [threads, isLoading, canUseRealtime]);

  const threadIds = useMemo(() => threads.map((thread) => thread.id).filter(Boolean).sort((a, b) => a - b), [threads]);

  useEffect(() => {
    if (!canUseRealtime) {
      return undefined;
    }

    const unsubscribe = subscribeToForum(threadIds, (event) => {
      if (event.type === "post" || event.type === "like" || event.type === "post_created" || event.type === "post_updated" || event.type === "post_liked") {
        setThreads((current) => upsertThread(current, event.payload, activeTopic));
      }
      if (event.type === "comment" || event.type === "comment_created") {
        setThreads((current) => appendComment(current, event.threadId || event.postId, event.payload));
      }
      if (event.type === "comment_updated") {
        setThreads((current) => patchComment(current, event.payload));
      }
      if (event.type === "post_deleted" || event.type === "post_hidden") {
        setThreads((current) => removeThread(current, event.postId || event.payload?.id));
      }
      if (event.type === "comment_deleted" || event.type === "comment_hidden") {
        setThreads((current) => removeComment(current, event.postId || event.payload?.postId, event.payload?.id));
      }
    });

    return unsubscribe;
  }, [activeTopic, canUseRealtime, threadIds.join(",")]);

  const hashtags = useMemo(() => {
    return [...new Set(threads.flatMap((thread) => thread.hashtags || []))].slice(0, 12);
  }, [threads]);

  const visibleThreads = useMemo(() => {
    return threads.filter((thread) => !activeHashtag || (thread.hashtags || []).includes(activeHashtag));
  }, [threads, activeHashtag]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "info") => {
    setToast({ message, type, id: Date.now() });
  };

  const requireLoginMessage = () => {
    showToast("Bạn cần đăng nhập để sử dụng chức năng này.", "error");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setSelectedImage(null);
      setImageError("");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError("Ảnh không được vượt quá 3MB.");
      event.target.value = "";
      return;
    }
    setImageError("");
    setSelectedImage(file);
  };

  const submitThread = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    if (!hasAuthToken()) {
      requireLoginMessage();
      return;
    }

    try {
      let saved;
      if (editingPostId) {
        saved = await apiRequest(`/api/forum/posts/${editingPostId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: form.title.trim(),
            body: form.body.trim(),
            tag: form.tag
          })
        });
      } else if (selectedImage) {
        const formData = new FormData();
        formData.append("title", form.title.trim());
        formData.append("body", form.body.trim());
        formData.append("tag", form.tag);
        formData.append("image", selectedImage);
        saved = await apiRequest("/api/forum/posts", {
          method: "POST",
          body: formData
        });
      } else {
        saved = await apiRequest("/api/forum/posts", {
          method: "POST",
          body: JSON.stringify({
            title: form.title.trim(),
            body: form.body.trim(),
            tag: form.tag
          })
        });
      }
      setThreads((current) => upsertThread(current, saved, form.tag));
      setForm({ title: "", body: "", tag: "Hỏi đáp" });
      setEditingPostId(null);
      setSelectedImage(null);
      setActiveTopic(form.tag);
      setActiveHashtag("");
      showToast(editingPostId ? "Đã cập nhật bài viết." : "Đã đăng bài viết.", "success");
    } catch (err) {
      if (err.message === "Unauthorized") {
        requireLoginMessage();
        return;
      }
      showToast(err.message || "Không thể lưu bài viết lúc này.", "error");
    }
  };

  const startEditPost = (thread) => {
    setEditingPostId(thread.id);
    setSelectedImage(null);
    setForm({
      title: thread.title || "",
      body: thread.body || "",
      tag: thread.tag || "Hỏi đáp"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setForm({ title: "", body: "", tag: "Hỏi đáp" });
    setSelectedImage(null);
  };

  const deleteThread = async (thread) => {
    if (!hasAuthToken()) {
      requireLoginMessage();
      return;
    }
    setConfirmDialog({
      title: "Xóa bài viết",
      message: "Bình luận trong bài cũng sẽ không còn hiển thị.",
      confirmText: "Xóa bài",
      onConfirm: async () => {
        try {
          await apiRequest(`/api/forum/posts/${thread.id}`, { method: "DELETE" });
          setThreads((current) => removeThread(current, thread.id));
          showToast("Đã xóa bài viết.", "success");
        } catch (err) {
          showToast(err.message || "Không thể xóa bài viết.", "error");
        }
      }
    });
  };

  const toggleLike = async (threadId) => {
    if (!hasAuthToken()) {
      requireLoginMessage();
      return;
    }

    try {
      const updated = await apiRequest(`/api/forum/posts/${threadId}/likes`, { method: "POST" });
      setThreads((current) => upsertThread(current, updated, activeTopic));
    } catch (err) {
      if (err.message === "Unauthorized") {
        requireLoginMessage();
        return;
      }
      showToast(err.message || "Không thể cập nhật lượt thích.", "error");
    }
  };

  const submitComment = async (threadId) => {
    const value = (commentDrafts[threadId] || "").trim();
    if (!value) return;
    if (!hasAuthToken()) {
      requireLoginMessage();
      return;
    }

    try {
      const created = await apiRequest(`/api/forum/posts/${threadId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: value })
      });
      setThreads((current) => appendComment(current, threadId, created));
      setCommentDrafts((prev) => ({ ...prev, [threadId]: "" }));
    } catch (err) {
      if (err.message === "Unauthorized") {
        requireLoginMessage();
        return;
      }
      showToast(err.message || "Không thể gửi bình luận.", "error");
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentBody(comment.body || "");
  };

  const saveCommentEdit = async (commentId) => {
    const value = editCommentBody.trim();
    if (!value) return;
    try {
      const updated = await apiRequest(`/api/forum/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ body: value })
      });
      setThreads((current) => patchComment(current, updated));
      setEditingCommentId(null);
      setEditCommentBody("");
    } catch (err) {
      showToast(err.message || "Không thể sửa bình luận.", "error");
    }
  };

  const deleteComment = async (comment) => {
    setConfirmDialog({
      title: "Xóa bình luận",
      message: "Bình luận này sẽ không còn hiển thị trong bài viết.",
      confirmText: "Xóa bình luận",
      onConfirm: async () => {
        try {
          await apiRequest(`/api/forum/comments/${comment.id}`, { method: "DELETE" });
          setThreads((current) => removeComment(current, comment.postId, comment.id));
          showToast("Đã xóa bình luận.", "success");
        } catch (err) {
          showToast(err.message || "Không thể xóa bình luận.", "error");
        }
      }
    });
  };

  const reportThread = async (thread) => {
    if (!hasAuthToken()) {
      requireLoginMessage();
      return;
    }
    setReportDialog({ type: "post", target: thread, reason: "", detail: "" });
  };

  const reportComment = async (comment) => {
    if (!hasAuthToken()) {
      requireLoginMessage();
      return;
    }
    setReportDialog({ type: "comment", target: comment, reason: "", detail: "" });
  };

  const submitReport = async () => {
    if (!reportDialog) return;
    const reason = [reportDialog.reason, reportDialog.detail]
      .map((item) => item?.trim())
      .filter(Boolean)
      .join(" - ");

    if (!reason) {
      showToast("Bạn cần chọn hoặc nhập lý do báo cáo.", "error");
      return;
    }

    try {
      await apiRequest("/api/forum/reports", {
        method: "POST",
        body: JSON.stringify(reportDialog.type === "post"
          ? { postId: reportDialog.target.id, reason }
          : { commentId: reportDialog.target.id, reason })
      });
      setReportDialog(null);
      showToast("Đã gửi báo cáo cho quản trị viên.", "success");
    } catch (err) {
      if (err.message === "Unauthorized") {
        requireLoginMessage();
        return;
      }
      showToast(err.message || "Không thể gửi báo cáo.", "error");
    }
  };

  const shareThread = async (thread) => {
    const url = `${window.location.origin}/community#post-${thread.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Đã sao chép liên kết bài viết.", "success");
    } catch {
      showToast(url, "info");
    }
  };

  return (
    <div className="page-shell community-shell">
      <HomeHeader />
      <main className="community-page social-community-page">
        <section className="community-social-hero">
          <div>
            <span>TTJobSocial</span>
            <h1>Cộng đồng nghề nghiệp của TTJobs</h1>
            <p>Hỏi kinh nghiệm, góp ý CV, chia sẻ cơ hội việc làm và trao đổi với nhà tuyển dụng trong một feed gọn, nhanh và tập trung.</p>
          </div>
          <div className="community-social-stats">
            <strong>{threads.length}</strong>
            <span>bài thảo luận</span>
          </div>
        </section>

        <section className="community-topic-bar" aria-label="Chủ đề diễn đàn">
          {topics.map((topic) => (
            <button
              key={topic.value}
              type="button"
              className={activeTopic === topic.value ? "active" : ""}
              onClick={() => {
                setActiveTopic(topic.value);
                setActiveHashtag("");
              }}
            >
              {topic.label}
            </button>
          ))}
        </section>

        <section className="community-social-layout">
          <aside className="community-left-rail">
            <form className="community-composer" onSubmit={submitThread}>
              <div className="community-composer-head">
                <span className="community-avatar">T</span>
                <div>
                  <strong>{editingPostId ? "Sửa bài viết" : "Tạo thảo luận mới"}</strong><br />
                  <small>{editingPostId ? "Cập nhật nội dung bài viết của bạn" : "Đặt câu hỏi hoặc chia sẻ trải nghiệm"}</small>
                </div>
              </div>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Tiêu đề ngắn gọn"
              />
              <textarea
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                placeholder="Bạn muốn thảo luận điều gì? Có thể thêm hashtag như #Java #CV"
              />
              {editingPostId ? <div className="community-filter-note">Ảnh hiện tại được giữ nguyên khi sửa bài.</div> : null}
              {imagePreviewUrl && !editingPostId ? (
                <div className="community-image-preview">
                  <img src={imagePreviewUrl} alt="Ảnh bài viết đang chọn" />
                  <button type="button" onClick={() => setSelectedImage(null)}>Gỡ ảnh</button>
                </div>
              ) : null}
              {imageError ? <div className="community-inline-error">{imageError}</div> : null}
              <div className="community-composer-footer">
                <select value={form.tag} onChange={(event) => setForm((prev) => ({ ...prev, tag: event.target.value }))}>
                  {topics.filter((topic) => topic.value !== "all").map((topic) => (
                    <option key={topic.value}>{topic.label}</option>
                  ))}
                </select>
                {!editingPostId ? (
                  <label className="community-image-picker">
                    Ảnh
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                  </label>
                ) : null}
                {editingPostId ? <button type="button" className="secondary" onClick={cancelEditPost}>Huỷ</button> : null}
                <button type="submit">{editingPostId ? "Lưu thay đổi" : "Đăng bài"}</button>
              </div>
            </form>

            <div className="community-hashtag-panel">
              <h2>Hashtag nổi bật</h2>
              <div>
                {hashtags.length ? hashtags.map((hashtag) => (
                  <button
                    key={hashtag}
                    type="button"
                    className={activeHashtag === hashtag ? "active" : ""}
                    onClick={() => {
                      setActiveHashtag(activeHashtag === hashtag ? "" : hashtag);
                      setActiveTopic("all");
                    }}
                  >
                    {hashtag}
                  </button>
                )) : <span>Chưa có hashtag</span>}
              </div>
            </div>
          </aside>

          <section className="community-feed">
            {error ? <div className="community-filter-note">{error}</div> : null}
            {activeHashtag ? (
              <div className="community-filter-note">
                Đang lọc theo <strong>{activeHashtag}</strong>
                <button type="button" onClick={() => setActiveHashtag("")}>Bỏ lọc</button>
              </div>
            ) : null}

            {isLoading ? (
              <p className="community-empty">Đang tải diễn đàn...</p>
            ) : visibleThreads.length === 0 ? (
              <p className="community-empty">Chưa có bài viết phù hợp.</p>
            ) : (
              visibleThreads.map((thread) => (
                <article
                  key={thread.id}
                  id={`post-${thread.id}`}
                  className={`community-post-card ${String(thread.id) === String(highlightedPostId) ? "is-targeted" : ""}`}
                >
                  <header>
                    <span className="community-avatar">{thread.author?.charAt(0) || "T"}</span>
                    <div>
                      <strong>{thread.author}</strong>
                      <small>{thread.role} · {formatTime(thread.createdAt)}</small>
                    </div>
                    <button type="button" onClick={() => setActiveTopic(thread.tag)}>{thread.tag}</button>
                  </header>

                  <h2>{thread.title}</h2>
                  <p>{thread.body}</p>

                  {thread.imageUrl ? (
                    <img className="community-post-image" src={thread.imageUrl} alt={thread.title || "Ảnh bài viết"} />
                  ) : null}

                  <div className="community-post-tags">
                    {(thread.hashtags || []).map((hashtag) => (
                      <button key={hashtag} type="button" onClick={() => setActiveHashtag(hashtag)}>
                        {hashtag}
                      </button>
                    ))}
                  </div>

                  <div className="community-post-metrics">
                    <span>{thread.likes || 0} lượt thích</span>
                    <span>{getCommentCount(thread)} bình luận</span>
                  </div>

                  <div className="community-post-actions">
                    <button type="button" className={thread.liked ? "active" : ""} onClick={() => toggleLike(thread.id)}>
                      <ActionIcon name="like" /> Thích
                    </button>
                    <button type="button" onClick={() => document.getElementById(`comment-${thread.id}`)?.focus()}>
                      <ActionIcon name="comment" /> Bình luận
                    </button>
                    <button type="button" onClick={() => shareThread(thread)}>
                      <ActionIcon name="share" /> Chia sẻ
                    </button>
                    <button type="button" onClick={() => reportThread(thread)}>
                      <ActionIcon name="flag" /> Báo cáo
                    </button>
                    {thread.editable ? (
                      <>
                        <button type="button" onClick={() => startEditPost(thread)}>Sửa</button>
                        <button type="button" onClick={() => deleteThread(thread)}>Xoá</button>
                      </>
                    ) : null}
                  </div>

                  <div className="community-comments">
                    {(thread.comments || []).map((comment) => (
                      <div
                        key={comment.id}
                        id={`comment-item-${comment.id}`}
                        className={`community-comment ${String(comment.id) === String(highlightedCommentId) ? "is-targeted" : ""}`}
                      >
                        <span>{comment.author?.charAt(0) || "T"}</span>
                        {editingCommentId === comment.id ? (
                          <div className="community-comment-edit">
                            <input
                              value={editCommentBody}
                              onChange={(event) => setEditCommentBody(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  saveCommentEdit(comment.id);
                                }
                              }}
                            />
                            <button type="button" onClick={() => saveCommentEdit(comment.id)}>Lưu</button>
                            <button type="button" onClick={() => setEditingCommentId(null)}>Huỷ</button>
                          </div>
                        ) : (
                          <p><strong>{comment.author}</strong>{comment.body}</p>
                        )}
                        {editingCommentId !== comment.id ? (
                          <div className="community-comment-actions">
                            {comment.editable ? <button type="button" onClick={() => startEditComment(comment)}>Sửa</button> : null}
                            {comment.editable ? <button type="button" onClick={() => deleteComment(comment)}>Xoá</button> : null}
                            <button type="button" onClick={() => reportComment(comment)}>Báo cáo</button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                    <div className="community-comment-form">
                      <input
                        id={`comment-${thread.id}`}
                        value={commentDrafts[thread.id] || ""}
                        onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [thread.id]: event.target.value }))}
                        placeholder="Viết bình luận..."
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            submitComment(thread.id);
                          }
                        }}
                      />
                      <button type="button" onClick={() => submitComment(thread.id)}>Gửi</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
        {toast ? (
          <div className={`community-toast ${toast.type}`} role="status">
            {toast.message}
          </div>
        ) : null}
        {confirmDialog ? (
          <div className="community-modal-backdrop" role="dialog" aria-modal="true">
            <div className="community-modal">
              <h2>{confirmDialog.title}</h2>
              <p>{confirmDialog.message}</p>
              <div className="community-modal-actions">
                <button type="button" className="secondary" onClick={() => setConfirmDialog(null)}>Huỷ</button>
                <button
                  type="button"
                  className="danger"
                  onClick={async () => {
                    const action = confirmDialog.onConfirm;
                    setConfirmDialog(null);
                    await action?.();
                  }}
                >
                  {confirmDialog.confirmText || "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {reportDialog ? (
          <div className="community-modal-backdrop" role="dialog" aria-modal="true">
            <div className="community-modal">
              <h2>Báo cáo nội dung</h2>
              <p>Chọn lý do để quản trị viên xử lý đúng ngữ cảnh.</p>
              <select
                className="community-report-reason"
                value={reportDialog.reason}
                onChange={(event) => setReportDialog((prev) => ({ ...prev, reason: event.target.value }))}
              >
                <option value="">Chọn lý do</option>
                <option value="Spam hoặc quảng cáo">Spam hoặc quảng cáo</option>
                <option value="Nội dung không phù hợp">Nội dung không phù hợp</option>
                <option value="Thông tin tuyển dụng sai lệch">Thông tin tuyển dụng sai lệch</option>
                <option value="Quấy rối hoặc công kích">Quấy rối hoặc công kích</option>
              </select>
              <textarea
                className="community-report-detail"
                value={reportDialog.detail}
                onChange={(event) => setReportDialog((prev) => ({ ...prev, detail: event.target.value }))}
                placeholder="Mô tả thêm nếu cần"
              />
              <div className="community-modal-actions">
                <button type="button" className="secondary" onClick={() => setReportDialog(null)}>Huỷ</button>
                <button type="button" onClick={submitReport}>Gửi báo cáo</button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Community;
