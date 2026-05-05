import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ToolCard from "../tools/components/ToolCard.jsx";
import ToolsLayout from "../tools/components/ToolsLayout.jsx";
import ToolSidebar from "../tools/components/ToolSidebar.jsx";
import { legacyToolSlugMap, toolsByGroup, toolsCatalog } from "../tools/toolsCatalog.js";

const Tools = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const legacyTool = searchParams.get("tool");
    if (!legacyTool) return;
    const slug = legacyToolSlugMap[legacyTool] || legacyTool;
    navigate(`/tools/${slug}`, { replace: true });
  }, [navigate, searchParams]);

  const filteredGroups = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return toolsByGroup;
    return toolsByGroup
      .map((group) => ({
        ...group,
        tools: group.tools.filter((tool) => (
          tool.title.toLowerCase().includes(query) ||
          tool.summary.toLowerCase().includes(query)
        ))
      }))
      .filter((group) => group.tools.length);
  }, [keyword]);

  return (
    <ToolsLayout>
      <section className="tools-landing-hero">
        <div>
          <span className="feature-pill">Công cụ TTJobs</span>
          <h1>Bộ công cụ tham khảo cho ứng viên hiện đại</h1>
          <p>Tính lương, thuế, bảo hiểm, lập kế hoạch tài chính, luyện phỏng vấn và khám phá phong cách làm việc trong một không gian thống nhất.</p>
        </div>
        <div className="tools-hero-card">
          <strong>{toolsCatalog.length}+</strong>
          <span>công cụ tài chính, nghề nghiệp và định vị bản thân</span>
        </div>
      </section>

      <div className="tool-page-grid">
        <ToolSidebar />
        <div className="tool-page-main">
          <section className="tools-search-panel">
            <div>
              <p>Công cụ nổi bật</p>
              <h2>Tìm nhanh công cụ bạn cần</h2>
            </div>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên công cụ..." />
          </section>

          {filteredGroups.map((group) => (
            <section className="tools-group-panel" key={group.id}>
              <div className="tool-section-heading">
                <p>{group.eyebrow}</p>
                <h2>{group.title}</h2>
                <span>{group.summary}</span>
              </div>
              <div className="tools-card-grid">
                {group.tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
              </div>
            </section>
          ))}

          {!filteredGroups.length ? (
            <section className="empty-tool-state">
              <h2>Không tìm thấy công cụ phù hợp</h2>
              <p>Thử tìm bằng từ khóa khác như lương, thuế, MBTI hoặc phỏng vấn.</p>
            </section>
          ) : null}
        </div>
      </div>
    </ToolsLayout>
  );
};

export default Tools;
