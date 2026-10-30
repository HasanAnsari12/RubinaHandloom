import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

import SettingsSidebar from "../../components/admin/settings/SettingsSidebar";
import {
  StoreSettingsTab,
  PaymentSettingsTab,
  ShippingSettingsTab,
  TaxSettingsTab,
  EmailSettingsTab,
  NotificationsSettingsTab,
  SecuritySettingsTab,
  AppearanceSettingsTab,
  MaintenanceSettingsTab,
} from "../../components/admin/settings/SettingsPanels";
import SystemInfoTab from "../../components/admin/settings/SystemInfoTab";
import "./Settings.css";

import { API_BASE_URL } from "../../utils/constants";

const Settings = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("store");

  // Full settings state
  const [settings, setSettings] = useState({
    store: {}, payment: {}, shipping: {}, tax: {},
    email: {}, notifications: {}, security: {}, appearance: {}, maintenance: {},
  });

  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sysLoading, setSysLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Email test state
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  // ─── Fetch all settings on mount ──────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSettings(data.settings);
    } catch (err) {
      toast.error(`Failed to load settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ─── Fetch system info ─────────────────────────────────────────
  const fetchSysInfo = useCallback(async () => {
    setSysLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings/system/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSysInfo(data.system);
    } catch (err) {
      toast.error(`Failed to fetch system info: ${err.message}`);
    } finally {
      setSysLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (activeTab === "system") {
      fetchSysInfo();
    }
  }, [activeTab, fetchSysInfo]);

  // ─── Update a field in a section ──────────────────────────────
  const handleChange = useCallback((section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  }, []);

  // ─── Save a section ───────────────────────────────────────────
  const handleSave = useCallback(async (section) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings/${section}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings[section]),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSettings((prev) => ({ ...prev, ...data.settings }));
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved!`);
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [token, settings]);

  // ─── Test SMTP ────────────────────────────────────────────────
  const handleTestEmail = useCallback(async () => {
    setTestLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings/email/test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testEmailAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
    } catch (err) {
      toast.error(`SMTP test failed: ${err.message}`);
    } finally {
      setTestLoading(false);
    }
  }, [token, testEmailAddress]);

  // ─── Render tab content ───────────────────────────────────────
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="settings-loading-state">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="settings-skeleton-card"></div>
          ))}
        </div>
      );
    }

    const makeOnChange = (section) => (key, val) => handleChange(section, key, val);
    const makeOnSave = (section) => () => handleSave(section);

    switch (activeTab) {
      case "store":
        return <StoreSettingsTab data={settings.store} onChange={makeOnChange("store")} onSave={makeOnSave("store")} saving={saving} />;
      case "payment":
        return <PaymentSettingsTab data={settings.payment} onChange={makeOnChange("payment")} onSave={makeOnSave("payment")} saving={saving} />;
      case "shipping":
        return <ShippingSettingsTab data={settings.shipping} onChange={makeOnChange("shipping")} onSave={makeOnSave("shipping")} saving={saving} />;
      case "tax":
        return <TaxSettingsTab data={settings.tax} onChange={makeOnChange("tax")} onSave={makeOnSave("tax")} saving={saving} />;
      case "email":
        return (
          <EmailSettingsTab
            data={settings.email}
            onChange={makeOnChange("email")}
            onSave={makeOnSave("email")}
            saving={saving}
            onTestEmail={handleTestEmail}
            testEmailAddress={testEmailAddress}
            onTestEmailAddressChange={setTestEmailAddress}
            testLoading={testLoading}
          />
        );
      case "notifications":
        return <NotificationsSettingsTab data={settings.notifications} onChange={makeOnChange("notifications")} onSave={makeOnSave("notifications")} saving={saving} />;
      case "security":
        return <SecuritySettingsTab data={settings.security} onChange={makeOnChange("security")} onSave={makeOnSave("security")} saving={saving} />;
      case "appearance":
        return <AppearanceSettingsTab data={settings.appearance} onChange={makeOnChange("appearance")} onSave={makeOnSave("appearance")} saving={saving} />;
      case "maintenance":
        return <MaintenanceSettingsTab data={settings.maintenance} onChange={makeOnChange("maintenance")} onSave={makeOnSave("maintenance")} saving={saving} />;
      case "system":
        return <SystemInfoTab sysInfo={sysInfo} loading={sysLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-page-container">
      {/* Page Title */}
      <div className="settings-page-header">
        <div>
          <h1 className="settings-page-title">
            <span className="settings-page-icon">⚙️</span>
            System Settings
          </h1>
          <p className="settings-page-subtitle">
            Manage store configuration, payment, shipping, notifications, and more.
          </p>
        </div>
      </div>

      <div className="settings-page-layout">
        {/* Left Tab Sidebar */}
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Right Content Area */}
        <div className="settings-content-area">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
