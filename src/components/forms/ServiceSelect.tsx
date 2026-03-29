import { useEffect, useMemo, useRef, useState } from "react";

type ServiceOption = {
  id: string;
  label: string;
  linkedGuildId?: string;
};

type ServiceSelectProps = {
  id: string;
  value: string;
  services: ServiceOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function ServiceSelect({
  id,
  value,
  services,
  onChange,
  placeholder = "Choose service",
  disabled = false,
}: ServiceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedService = useMemo(() => {
    return services.find((service) => service.id === value) ?? null;
  }, [services, value]);

  useEffect(() => {
    function handleOutside(event: MouseEvent): void {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="service-select" ref={rootRef}>
      <button
        id={id}
        type="button"
        className={[
          "service-select__trigger",
          isOpen ? "service-select__trigger--open" : "",
        ]
          .join(" ")
          .trim()}
        onClick={() => {
          if (!disabled) {
            setIsOpen((previous) => !previous);
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
      >
        <span className="service-select__trigger-text">
          {selectedService ? selectedService.label : placeholder}
        </span>

        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="service-select__caret"
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          id={`${id}-menu`}
          className="service-select__menu"
          role="listbox"
          aria-labelledby={id}
        >
          <button
            type="button"
            className={[
              "service-select__option",
              value === "" ? "service-select__option--selected" : "",
            ]
              .join(" ")
              .trim()}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
          >
            <span className="service-select__option-label">{placeholder}</span>
          </button>

          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={[
                "service-select__option",
                value === service.id ? "service-select__option--selected" : "",
                service.linkedGuildId ? "service-select__option--disabled" : "",
              ]
                .join(" ")
                .trim()}
              onClick={() => {
                if (service.linkedGuildId) {
                  return;
                }

                onChange(service.id);
                setIsOpen(false);
              }}
              disabled={Boolean(service.linkedGuildId)}
            >
              <span className="service-select__option-label">
                {service.label}
              </span>

              {service.linkedGuildId ? (
                <span className="service-select__meta">linked</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
