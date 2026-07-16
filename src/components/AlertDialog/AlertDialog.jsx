import React, { useEffect } from "react";
import "./AlertDialog.css";

export default function AlertDialog({
  open,
  type = "info",
  title = "Message",
  message = "",
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showCancel) {
        onCancel?.();
      }

      if (event.key === "Enter") {
        onConfirm?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, showCancel, onConfirm, onCancel]);

  if (!open) {
    return null;
  }

  const icons = {
    success: "✓",
    warning: "!",
    error: "×",
    info: "i",
  };

  return (
    <div
      className="alert-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          showCancel
        ) {
          onCancel?.();
        }
      }}
    >
      <section
        className={`alert-dialog alert-${type}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-message"
      >
        <header className="alert-header">
          <div className={`alert-icon alert-icon-${type}`}>
            {icons[type] ?? icons.info}
          </div>

          <div>
            <span className="alert-eyebrow">
              Chiquita Catering POS
            </span>

            <h2 id="alert-dialog-title">
              {title}
            </h2>
          </div>
        </header>

        <div
          id="alert-dialog-message"
          className="alert-body"
        >
          {message}
        </div>

        <footer className="alert-footer">
          {showCancel && (
            <button
              type="button"
              className="alert-button alert-button-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className="alert-button alert-button-primary"
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </footer>
      </section>
    </div>
  );
}