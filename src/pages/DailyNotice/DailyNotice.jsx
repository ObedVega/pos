import React, { useState } from "react";
import "./DailyNotice.css";

const defaultNoticeText = `Please keep your areas clean. All trash must be thrown away in the trash dumpsters. Any outside trash thrown in our dumpsters will result in a $50 fee. All returns or exchanges will be inspected and must be in the condition purchased. If the item is damaged you will be charged for it.

Please make sure that your truck is locked and properly secured before you leave each day.

We are currently working with Lloyd Pestcontrol Management for pest control. If you are interested in starting service, please contact them at (800)223-2847.

Note: We are not responsible for the management and cleanliness of the trucks/businesses that we have given parking space to. If you have any complaints with a truck's operation you must talk to their manager. If any court related actions plan to take place you will have to employee your own legal staff.`;

let savedNoticeText = defaultNoticeText;

const formatLoadedTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

export default function DailyNoticeManager({ onClose }) {
  const [noticeText, setNoticeText] = useState(savedNoticeText);
  const [loadedAt] = useState(formatLoadedTime);

  const handleSaveAndExit = () => {
    savedNoticeText = noticeText;
    onClose();
  };

  const handleCancel = () => {
    setNoticeText(savedNoticeText);
    onClose();
  };

  return (
    <div className="daily-notice-overlay" role="presentation">
      <section
        className="daily-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-notice-title"
      >
        <header className="daily-notice-header">
          <h2 id="daily-notice-title">Daily Notice Manager</h2>

          <button
            type="button"
            className="daily-notice-close"
            onClick={handleCancel}
            aria-label="Close daily notice"
          >
            ×
          </button>
        </header>

        <div className="daily-notice-body">
          <textarea
            className="daily-notice-textarea"
            value={noticeText}
            onChange={(event) => setNoticeText(event.target.value)}
            spellCheck={false}
          />
        </div>

        <footer className="daily-notice-footer">
          <span className="daily-notice-loaded">
            Loaded: {loadedAt}
          </span>

          <div className="daily-notice-actions">
            <button
              type="button"
              className="daily-notice-save-button"
              onClick={handleSaveAndExit}
            >
              Save and Exit
            </button>

            <button
              type="button"
              className="daily-notice-cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}