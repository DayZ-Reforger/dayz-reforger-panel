type ConfirmDialogProps = {
  open: boolean;
  tone?: "default" | "danger";
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  tone = "default",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-dialog-backdrop" onClick={onCancel}>
      <div
        className={`confirm-dialog confirm-dialog--${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog__content">
          <div className="confirm-dialog__icon-wrap" aria-hidden="true">
            <span className="confirm-dialog__icon">!</span>
          </div>

          <div className="confirm-dialog__text">
            <h3 id="confirm-dialog-title" className="confirm-dialog__title">
              {title}
            </h3>

            <p
              id="confirm-dialog-description"
              className="confirm-dialog__description"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="confirm-dialog__footer">
          <button
            type="button"
            className="button button--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="button button--danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Unlinking..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
