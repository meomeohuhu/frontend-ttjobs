const formatNumberInput = (value) => String(value ?? "");

const CalculatorPanel = ({ title, description, fields, values, onChange, children, actionLabel = "Tính lại" }) => (
  <section className="calculator-panel">
    <div className="tool-section-heading">
      <p>Nhập thông tin</p>
      <h2>{title}</h2>
      {description ? <span>{description}</span> : null}
    </div>
    <div className="calc-field-grid">
      {fields.map((field) => (
        <label className="calc-input-wrap" key={field.name}>
          <span>
            {field.label}
            {field.helper ? <small title={field.helper}>?</small> : null}
          </span>
          {field.type === "select" ? (
            <select value={values[field.name]} onChange={(event) => onChange(field.name, event.target.value)}>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              inputMode={field.inputMode || "numeric"}
              value={formatNumberInput(values[field.name])}
              onChange={(event) => onChange(field.name, event.target.value)}
              placeholder={field.placeholder}
            />
          )}
          {field.unit ? <em>{field.unit}</em> : null}
        </label>
      ))}
    </div>
    <button className="tool-primary-button" type="button">{actionLabel}</button>
    {children}
  </section>
);

export default CalculatorPanel;
