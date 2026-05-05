import ToolsLayout from "../../tools/components/ToolsLayout.jsx";
import ToolSidebar from "../../tools/components/ToolSidebar.jsx";
import ToolGlyph from "../../tools/components/ToolGlyph.jsx";

const ToolPageShell = ({ tool, children }) => (
  <ToolsLayout>
    <div className="tool-page-grid">
      <ToolSidebar />
      <div className="tool-page-main">
        <section className="tool-page-hero">
          <div className="tool-page-hero-icon">
            <ToolGlyph name={tool.icon} />
          </div>
          <div>
            <p>Công cụ TTJobs</p>
            <h1>{tool.title}</h1>
            <span>{tool.summary}</span>
          </div>
        </section>
        {children}
      </div>
    </div>
  </ToolsLayout>
);

export default ToolPageShell;
