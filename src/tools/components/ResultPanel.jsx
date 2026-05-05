import { useMemo, useState } from "react";

export const formatVnd = (value) => `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(value) || 0))} VND`;

const ResultPanel = ({ title, rows, note, chartRows = [], points = [] }) => {
  const [copied, setCopied] = useState(false);
  const maxPoint = useMemo(() => Math.max(...points.map((point) => point.value), 1), [points]);

  const copyResult = async () => {
    const text = rows.map((row) => `${row.label}: ${row.value}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="result-panel">
      <div className="result-panel-head">
        <h2>{title}</h2>
        <button type="button" onClick={copyResult}>Sao chép</button>
      </div>
      <div className="result-rows">
        {rows.map((row) => (
          <div className={row.highlight ? "is-highlight" : ""} key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
      {chartRows.length ? (
        <div className="result-bar-chart">
          {chartRows.map((row) => (
            <span key={row.label} style={{ width: `${row.percent}%`, background: row.color }} title={`${row.label}: ${row.percent}%`} />
          ))}
        </div>
      ) : null}
      {points.length ? (
        <div className="result-line-chart">
          {points.map((point, index) => (
            <span
              key={`${point.label}-${index}`}
              style={{ height: `${Math.max(8, (point.value / maxPoint) * 100)}%` }}
              title={`${point.label}: ${formatVnd(point.value)}`}
            />
          ))}
        </div>
      ) : null}
      {note ? <p className="result-note">{note}</p> : null}
      {copied ? <div className="toast-notify">Đã sao chép kết quả</div> : null}
    </section>
  );
};

export default ResultPanel;
