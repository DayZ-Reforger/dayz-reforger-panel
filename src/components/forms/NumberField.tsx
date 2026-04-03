import { useEffect, useState } from "react";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
};

function clamp(value: number, min?: number, max?: number): number {
  let next = value;

  if (typeof min === "number") {
    next = Math.max(min, next);
  }

  if (typeof max === "number") {
    next = Math.min(max, next);
  }

  return next;
}

export function NumberField({
  label,
  value,
  onChange,
  required = false,
  min,
  max,
  step = 1,
  error,
}: Props) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit(nextText: string) {
    if (!nextText.trim()) {
      setText(String(value));
      return;
    }

    const parsed = Number(nextText);

    if (!Number.isFinite(parsed)) {
      setText(String(value));
      return;
    }

    const bounded = clamp(parsed, min, max);
    onChange(bounded);
    setText(String(bounded));
  }

  return (
    <label className={`field${error ? " field--error" : ""}`}>
      <span className="field__label">{label}</span>
      <input
        type="number"
        value={text}
        min={min}
        max={max}
        step={step}
        required={required}
        onChange={(event) => setText(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
      />
      {error ? <p className="field__error">{error}</p> : null}
    </label>
  );
}
