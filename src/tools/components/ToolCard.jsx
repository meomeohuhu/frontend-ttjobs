import { Link } from "react-router-dom";
import ToolGlyph from "./ToolGlyph.jsx";

const ToolCard = ({ tool }) => (
  <Link className="tool-card" to={tool.to}>
    <span className="tool-icon">
      <ToolGlyph name={tool.icon} />
    </span>
    <span className="tool-card-copy">
      <span className="tool-card-title">
        {tool.title}
        {tool.badge ? <em>{tool.badge}</em> : null}
      </span>
      <span className="tool-card-summary">{tool.summary}</span>
      <strong>Mở công cụ</strong>
    </span>
  </Link>
);

export default ToolCard;
