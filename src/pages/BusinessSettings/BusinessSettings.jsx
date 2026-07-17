import React, {
  useEffect,
  useState,
} from "react";

import businessSettingsService
  from "../../services/businessSettingsService";

import "./BusinessSettings.css";

export default function BusinessSettings({
  onClose,
}) {
  const [settings, setSettings] =
    useState(null);

  const [savedSettings, setSavedSettings] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSelectingLogo, setIsSelectingLogo] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result =
          await businessSettingsService.get();

        setSettings(result);
        setSavedSettings(result);
      } catch (loadError) {
        console.error(
          "Could not load business settings:",
          loadError
        );

        setError(
          "Business settings could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateField = (field, value) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [field]: value,
    }));
  };

  const handleSelectLogo = async () => {
    try {
      setIsSelectingLogo(true);
      setError("");

      const result =
        await businessSettingsService.selectLogo();

      if (!result) {
        return;
      }

      setSettings((currentSettings) => ({
        ...currentSettings,
        logoPath: result.logoPath,
        logoUrl: result.logoUrl,
      }));
    } catch (selectError) {
      console.error(
        "Could not select business logo:",
        selectError
      );

      setError(
        selectError.message ||
        "The logo could not be selected."
      );
    } finally {
      setIsSelectingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!settings.businessName.trim()) {
      setError("Business name is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const result =
  await businessSettingsService.save({
    ...settings,

    businessName:
      String(settings.businessName ?? "").trim(),

    businessSubtitle:
      String(
        settings.businessSubtitle ?? ""
      ).trim(),

    addressLine1:
      String(
        settings.addressLine1 ?? ""
      ).trim(),

    addressLine2:
      String(
        settings.addressLine2 ?? ""
      ).trim(),

    city:
      String(settings.city ?? "").trim(),

    state:
      String(settings.state ?? "").trim(),

    zipCode:
      String(
        settings.zipCode ?? ""
      ).trim(),

    phone:
      String(settings.phone ?? "").trim(),
permitNumber:
  String(
    settings.permitNumber ?? ""
  ).trim(),
    email:
      String(settings.email ?? "").trim(),

    website:
      String(settings.website ?? "").trim(),

    paymentTerms:
      String(
        settings.paymentTerms ??
          "Due upon receipt"
      ).trim(),
  });

      setSavedSettings(result);
      onClose();
    } catch (saveError) {
      console.error(
        "Could not save business settings:",
        saveError
      );

      setError(
        saveError.message ||
        "Business settings could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSettings(savedSettings);
    onClose();
  };

  if (isLoading || !settings) {
    return (
      <div className="business-settings-overlay">
        <div className="business-settings-loading">
          Loading business settings...
        </div>
      </div>
    );
  }

  return (
    <div className="business-settings-overlay">
      <section
        className="business-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-settings-title"
      >
        <header className="business-settings-header">
          <div>
            <span className="business-settings-eyebrow">
              System configuration
            </span>

            <h2 id="business-settings-title">
              Business Settings
            </h2>
          </div>

          <button
            type="button"
            className="business-settings-close"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Close business settings"
          >
            ×
          </button>
        </header>

        <div className="business-settings-content">
          <section className="business-settings-section">
            <div className="business-settings-section-title">
              <h3>Business information</h3>
              <p>
                This information will appear on invoices.
              </p>
            </div>

            <div className="business-settings-grid">
              <label className="business-settings-field">
                <span>Business name</span>

                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(event) =>
                    updateField(
                      "businessName",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="business-settings-field">
                <span>Subtitle</span>

                <input
                  type="text"
                  value={settings.businessSubtitle}
                  onChange={(event) =>
                    updateField(
                      "businessSubtitle",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="business-settings-field business-settings-wide">
                <span>Address</span>

                <input
                  type="text"
                  value={settings.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Business address"
                />
              </label>

              <label className="business-settings-field">
                <span>Phone</span>

                <input
                  type="text"
                  value={settings.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="Business phone"
                />
              </label>
<label className="business-settings-field">
  <span>Permit number</span>

  <input
    type="text"
    value={settings.permitNumber ?? ""}
    onChange={(event) =>
      updateField(
        "permitNumber",
        event.target.value
      )
    }
    placeholder="Permit number"
  />
</label>
              <label className="business-settings-field">
                <span>Email</span>

                <input
                  type="email"
                  value={settings.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="Business email"
                />
              </label>

              <label className="business-settings-field business-settings-wide">
                <span>Website</span>

                <input
                  type="text"
                  value={settings.website}
                  onChange={(event) =>
                    updateField(
                      "website",
                      event.target.value
                    )
                  }
                  placeholder="Website"
                />
              </label>
            </div>
          </section>

          <section className="business-settings-section">
            <div className="business-settings-section-title">
              <h3>Invoice logo</h3>
              <p>
                PNG, JPG, JPEG or WEBP. Maximum 2 MB.
              </p>
            </div>

            <div className="business-logo-row">
              <div className="business-logo-preview">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Business logo preview"
                  />
                ) : (
                  <span>No logo selected</span>
                )}
              </div>

              <div className="business-logo-actions">
                <button
                  type="button"
                  className="business-settings-secondary"
                  onClick={handleSelectLogo}
                  disabled={
                    isSelectingLogo || isSaving
                  }
                >
                  {isSelectingLogo
                    ? "Selecting..."
                    : "Choose Logo"}
                </button>

                {settings.logoPath && (
                  <small>
                    {settings.logoPath}
                  </small>
                )}
              </div>
            </div>
          </section>

          {error && (
            <div
              className="business-settings-error"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>

        <footer className="business-settings-footer">
          <button
            type="button"
            className="business-settings-secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="business-settings-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : "Save Settings"}
          </button>
        </footer>
      </section>
    </div>
  );
}