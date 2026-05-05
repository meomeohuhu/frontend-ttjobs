const paths = {
  wallet: ["M4 7h16v12H4z", "M16 11h4v4h-4a2 2 0 0 1 0-4z", "M7 7V5h10v2"],
  receipt: ["M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1z", "M9 8h6", "M9 12h6", "M9 16h4"],
  shield: ["M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z", "M9 12l2 2 4-5"],
  archive: ["M4 6h16v4H4z", "M6 10h12v10H6z", "M10 14h4"],
  trend: ["M4 17l6-6 4 4 6-8", "M15 7h5v5"],
  target: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z", "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"],
  spark: ["M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z", "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"],
  radar: ["M12 3l8 5v8l-8 5-8-5V8z", "M12 7l4 2.5v5L12 17l-4-2.5v-5z"],
  chat: ["M5 5h14v11H8l-3 3z", "M8 9h8", "M8 13h5"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M16 16l4 4"]
};

const ToolGlyph = ({ name = "spark", className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {(paths[name] || paths.spark).map((path) => (
      <path key={path} d={path} />
    ))}
  </svg>
);

export default ToolGlyph;
