type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
};

export function Switch({ label, checked, onChange, hint }: Props) {
  return (
    <div className="field">
      <div className="field__label-row">
        <span className="field__label">{label}</span>
      </div>
      {hint ? <p className="field__hint">{hint}</p> : null}

      <button
        type="button"
        className={`switch${checked ? " is-on" : ""}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__track">
          <span className="switch__thumb" />
        </span>
        <span className="switch__text">{checked ? "Enabled" : "Disabled"}</span>
      </button>
    </div>
  );
}
