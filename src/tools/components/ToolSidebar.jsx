import { Link, useLocation } from "react-router-dom";
import { toolsByGroup } from "../toolsCatalog.js";
import ToolGlyph from "./ToolGlyph.jsx";

const ToolSidebar = () => {
  const location = useLocation();

  return (
    <aside className="tool-sidebar">
      <Link className="tool-sidebar-home" to="/tools">Tất cả công cụ</Link>
      {toolsByGroup.map((group) => (
        <section key={group.id}>
          <h3>{group.title}</h3>
          {group.tools.map((tool) => (
            <Link
              key={tool.id}
              className="tool-sidebar-link"
              data-active={location.pathname === tool.to ? "true" : "false"}
              to={tool.to}
            >
              <ToolGlyph name={tool.icon} />
              <span>{tool.title}</span>
            </Link>
          ))}
        </section>
      ))}
    </aside>
  );
};

export default ToolSidebar;
