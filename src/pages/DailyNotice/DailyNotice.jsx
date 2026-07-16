import React, {
  useEffect,
  useState,
} from "react";

import dailyNoticeService from "../../services/dailyNoticeService";

import "./DailyNotice.css";

const formatLoadedTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

export default function DailyNoticeManager({
  onClose,
}) {
  const [noticeText, setNoticeText] =
    useState("");

  const [savedNoticeText, setSavedNoticeText] =
    useState("");

  const [loadedAt, setLoadedAt] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadNotice = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result =
          await dailyNoticeService.get();

        const text = result.notice || "";

        setNoticeText(text);
        setSavedNoticeText(text);
        setLoadedAt(formatLoadedTime());
      } catch (loadError) {
        console.error(
          "Could not load daily notice:",
          loadError
        );

        setError(
          "The daily notice could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadNotice();
  }, []);

  const handleSaveAndExit = async () => {
    try {
      setIsSaving(true);
      setError("");

      const savedNotice =
        await dailyNoticeService.save(
          noticeText
        );

      setSavedNoticeText(
        savedNotice.notice
      );

      onClose();
    } catch (saveError) {
      console.error(
        "Could not save daily notice:",
        saveError
      );

      setError(
        "The daily notice could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNoticeText(savedNoticeText);
    onClose();
  };

  return (
    <div
      className="daily-notice-overlay"
      role="presentation"
    >
      <section
        className="daily-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-notice-title"
      >
        <header className="daily-notice-header">
          <h2 id="daily-notice-title">
            Daily Notice Manager
          </h2>

          <button
            type="button"
            className="daily-notice-close"
            onClick={handleCancel}
            aria-label="Close daily notice"
            disabled={isSaving}
          >
            ×
          </button>
        </header>

        <div className="daily-notice-body">
          {isLoading ? (
            <div className="daily-notice-loading">
              Loading daily notice...
            </div>
          ) : (
            <textarea
              className="daily-notice-textarea"
              value={noticeText}
              onChange={(event) =>
                setNoticeText(
                  event.target.value
                )
              }
              spellCheck={false}
              disabled={isSaving}
            />
          )}

          {error && (
            <div
              className="daily-notice-error"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>

        <footer className="daily-notice-footer">
          <span className="daily-notice-loaded">
            Loaded: {loadedAt || "--"}
          </span>

          <div className="daily-notice-actions">
            <button
              type="button"
              className="daily-notice-save-button"
              onClick={handleSaveAndExit}
              disabled={
                isLoading || isSaving
              }
            >
              {isSaving
                ? "Saving..."
                : "Save and Exit"}
            </button>

            <button
              type="button"
              className="daily-notice-cancel-button"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}