import React from "react";
import SettingsCard from "./SettingsCard";
import "./SettingsCard.css";

const SettingsToggle = ({ title, description, checked, onChange }) => (
  <div className="settings-toggle-row">
    <div className="settings-toggle-left">
      <span className="settings-toggle-title">{title}</span>
      {description && <span className="settings-toggle-desc">{description}</span>}
    </div>
    <label className="settings-toggle-switch">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="settings-toggle-slider"></span>
    </label>
  </div>
);

// ─── STORE SETTINGS TAB ────────────────────────────────────────────────────
export const StoreSettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Store Information"
    description="Configure your store name, contact details, and branding."
    icon="🏪"
    onSave={onSave}
    saving={saving}
  >
    <div className="settings-form-grid">
      <div className="settings-field">
        <label>Store Name</label>
        <input type="text" value={data.name || ""} onChange={(e) => onChange("name", e.target.value)} placeholder="SRK Handloom" />
      </div>
      <div className="settings-field">
        <label>Tagline</label>
        <input type="text" value={data.tagline || ""} onChange={(e) => onChange("tagline", e.target.value)} placeholder="Premium Handwoven Fabrics" />
      </div>
      <div className="settings-field">
        <label>Contact Email</label>
        <input type="email" value={data.contactEmail || ""} onChange={(e) => onChange("contactEmail", e.target.value)} placeholder="asarik782@gmail.com" />
      </div>
      <div className="settings-field">
        <label>Contact Phone</label>
        <input type="tel" value={data.contactPhone || ""} onChange={(e) => onChange("contactPhone", e.target.value)} placeholder="+91 7000438132" />
      </div>
      <div className="settings-field">
        <label>Currency</label>
        <select value={data.currency || "INR"} onChange={(e) => onChange("currency", e.target.value)}>
          <option value="INR">INR — Indian Rupee (₹)</option>
          <option value="USD">USD — US Dollar ($)</option>
          <option value="EUR">EUR — Euro (€)</option>
          <option value="GBP">GBP — British Pound (£)</option>
        </select>
      </div>
      <div className="settings-field">
        <label>Currency Symbol</label>
        <input type="text" value={data.currencySymbol || "₹"} onChange={(e) => onChange("currencySymbol", e.target.value)} placeholder="₹" />
      </div>
      <div className="settings-field full-width">
        <label>Store Address</label>
        <textarea value={data.address || ""} onChange={(e) => onChange("address", e.target.value)} placeholder="Street / Area / Locality" rows={2} />
      </div>
      <div className="settings-field">
        <label>City</label>
        <input type="text" value={data.city || ""} onChange={(e) => onChange("city", e.target.value)} placeholder="Chanderi" />
      </div>
      <div className="settings-field">
        <label>State</label>
        <input type="text" value={data.state || ""} onChange={(e) => onChange("state", e.target.value)} placeholder="Madhya Pradesh" />
      </div>
      <div className="settings-field">
        <label>PIN Code</label>
        <input type="text" value={data.pincode || ""} onChange={(e) => onChange("pincode", e.target.value)} placeholder="221001" />
      </div>
      <div className="settings-field">
        <label>Country</label>
        <input type="text" value={data.country || "India"} onChange={(e) => onChange("country", e.target.value)} />
      </div>
      <div className="settings-field">
        <label>Logo URL</label>
        <input type="url" value={data.logoUrl || ""} onChange={(e) => onChange("logoUrl", e.target.value)} placeholder="https://..." />
        <span className="field-hint">Paste a Cloudinary or CDN URL for your store logo.</span>
      </div>
    </div>
  </SettingsCard>
);

// ─── PAYMENT SETTINGS TAB ─────────────────────────────────────────────────
export const PaymentSettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Payment Settings"
    description="Configure Razorpay API keys, COD rules, and payment gateways."
    icon="💳"
    onSave={onSave}
    saving={saving}
  >
    <div className="settings-section-label">Razorpay</div>
    <SettingsToggle
      title="Enable Razorpay"
      description="Accept online payments via Razorpay."
      checked={data.razorpayEnabled}
      onChange={(v) => onChange("razorpayEnabled", v)}
    />
    <div className="settings-form-grid" style={{ marginTop: 16 }}>
      <div className="settings-field">
        <label>Razorpay Key ID</label>
        <input type="text" value={data.razorpayKeyId || ""} onChange={(e) => onChange("razorpayKeyId", e.target.value)} placeholder="rzp_live_..." />
      </div>
      <div className="settings-field">
        <label>Razorpay Key Secret</label>
        <input type="password" value={data.razorpayKeySecret === "[REDACTED]" ? "" : (data.razorpayKeySecret || "")} onChange={(e) => onChange("razorpayKeySecret", e.target.value)} placeholder="Enter new secret to update" />
        <span className="field-hint">Leave blank to keep existing secret.</span>
      </div>
    </div>

    <div className="settings-section-divider"></div>
    <div className="settings-section-label">Cash on Delivery</div>
    <SettingsToggle
      title="Enable Cash on Delivery"
      description="Allow customers to pay on delivery."
      checked={data.codEnabled}
      onChange={(v) => onChange("codEnabled", v)}
    />
    <div className="settings-form-grid" style={{ marginTop: 16 }}>
      <div className="settings-field">
        <label>COD Extra Charge (₹)</label>
        <input type="number" min="0" value={data.codCharge ?? 0} onChange={(e) => onChange("codCharge", Number(e.target.value))} />
        <span className="field-hint">Additional charge for COD orders. Set 0 for free.</span>
      </div>
      <div className="settings-field">
        <label>Minimum Order for COD (₹)</label>
        <input type="number" min="0" value={data.codMinOrderAmount ?? 0} onChange={(e) => onChange("codMinOrderAmount", Number(e.target.value))} />
        <span className="field-hint">Minimum order value required for COD. Set 0 for no limit.</span>
      </div>
    </div>
  </SettingsCard>
);

// ─── SHIPPING SETTINGS TAB ────────────────────────────────────────────────
export const ShippingSettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Shipping Settings"
    description="Set shipping charges, free shipping rules, and delivery estimates."
    icon="🚚"
    onSave={onSave}
    saving={saving}
  >
    <SettingsToggle
      title="Enable Free Shipping"
      description="Waive shipping charges above a minimum order value."
      checked={data.freeShippingEnabled}
      onChange={(v) => onChange("freeShippingEnabled", v)}
    />
    <div className="settings-form-grid" style={{ marginTop: 16 }}>
      <div className="settings-field">
        <label>Free Shipping Threshold (₹)</label>
        <input type="number" min="0" value={data.freeShippingThreshold ?? 999} onChange={(e) => onChange("freeShippingThreshold", Number(e.target.value))} />
        <span className="field-hint">Orders above this amount get free shipping.</span>
      </div>
      <div className="settings-field">
        <label>Default Shipping Charge (₹)</label>
        <input type="number" min="0" value={data.defaultShippingCharge ?? 99} onChange={(e) => onChange("defaultShippingCharge", Number(e.target.value))} />
      </div>
    </div>

    <div className="settings-section-divider"></div>
    <SettingsToggle
      title="Enable Express Shipping"
      description="Offer premium fast delivery option to customers."
      checked={data.expressShippingEnabled}
      onChange={(v) => onChange("expressShippingEnabled", v)}
    />
    <div className="settings-form-grid" style={{ marginTop: 16 }}>
      <div className="settings-field">
        <label>Express Shipping Charge (₹)</label>
        <input type="number" min="0" value={data.expressShippingCharge ?? 199} onChange={(e) => onChange("expressShippingCharge", Number(e.target.value))} />
      </div>
      <div className="settings-field">
        <label>Estimated Delivery Days</label>
        <input type="number" min="1" value={data.estimatedDeliveryDays ?? 7} onChange={(e) => onChange("estimatedDeliveryDays", Number(e.target.value))} />
        <span className="field-hint">Shown to customers at checkout (standard delivery).</span>
      </div>
    </div>
  </SettingsCard>
);

// ─── TAX & GST SETTINGS TAB ───────────────────────────────────────────────
export const TaxSettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Tax & GST Settings"
    description="Configure GST percentage, GSTIN, and tax inclusion rules."
    icon="🧾"
    onSave={onSave}
    saving={saving}
  >
    <SettingsToggle
      title="Enable GST"
      description="Apply GST to all orders."
      checked={data.gstEnabled}
      onChange={(v) => onChange("gstEnabled", v)}
    />
    <SettingsToggle
      title="GST Inclusive Pricing"
      description="Product prices already include GST (MRP pricing)."
      checked={data.gstInclusive}
      onChange={(v) => onChange("gstInclusive", v)}
    />
    <div className="settings-form-grid" style={{ marginTop: 16 }}>
      <div className="settings-field">
        <label>GST Percentage (%)</label>
        <input type="number" min="0" max="100" value={data.gstPercentage ?? 12} onChange={(e) => onChange("gstPercentage", Number(e.target.value))} />
      </div>
      <div className="settings-field">
        <label>GSTIN Number</label>
        <input type="text" value={data.gstin || ""} onChange={(e) => onChange("gstin", e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
      </div>
      <div className="settings-field">
        <label>HSN Code (Textiles)</label>
        <input type="text" value={data.hsnCode || ""} onChange={(e) => onChange("hsnCode", e.target.value)} placeholder="5208" />
        <span className="field-hint">HSN code for handloom fabric. Common: 5208, 5407, 6302.</span>
      </div>
    </div>
  </SettingsCard>
);

// ─── EMAIL / SMTP SETTINGS TAB ────────────────────────────────────────────
export const EmailSettingsTab = ({ data, onChange, onSave, saving, onTestEmail, testEmailAddress, onTestEmailAddressChange, testLoading }) => (
  <>
    <SettingsCard
      title="SMTP Configuration"
      description="Configure the email server used to send order confirmations, alerts, and notifications."
      icon="📧"
      onSave={onSave}
      saving={saving}
    >
      <div className="settings-form-grid">
        <div className="settings-field">
          <label>SMTP Host</label>
          <input type="text" value={data.smtpHost || ""} onChange={(e) => onChange("smtpHost", e.target.value)} placeholder="smtp.gmail.com" />
        </div>
        <div className="settings-field">
          <label>SMTP Port</label>
          <input type="number" value={data.smtpPort || 587} onChange={(e) => onChange("smtpPort", Number(e.target.value))} />
        </div>
        <div className="settings-field">
          <label>SMTP Username</label>
          <input type="email" value={data.smtpUser || ""} onChange={(e) => onChange("smtpUser", e.target.value)} placeholder="youremail@gmail.com" />
        </div>
        <div className="settings-field">
          <label>SMTP Password / App Password</label>
          <input type="password" value={data.smtpPass === "[REDACTED]" ? "" : (data.smtpPass || "")} onChange={(e) => onChange("smtpPass", e.target.value)} placeholder="Enter to update" />
          <span className="field-hint">For Gmail, use App Passwords — not your regular password.</span>
        </div>
        <div className="settings-field">
          <label>Sender Name</label>
          <input type="text" value={data.smtpFromName || ""} onChange={(e) => onChange("smtpFromName", e.target.value)} placeholder="SRK Handloom" />
        </div>
        <div className="settings-field">
          <label>Sender Email</label>
          <input type="email" value={data.smtpFromEmail || ""} onChange={(e) => onChange("smtpFromEmail", e.target.value)} placeholder="noreply@srkhandloom.com" />
        </div>
      </div>
      <SettingsToggle
        title="Use Secure Connection (TLS)"
        description="Enable for port 465. Disable for port 587 (STARTTLS)."
        checked={data.smtpSecure}
        onChange={(v) => onChange("smtpSecure", v)}
      />
    </SettingsCard>

    <SettingsCard
      title="Email Triggers"
      description="Choose which events trigger automated emails."
      icon="📨"
    >
      <SettingsToggle title="Order Confirmation Email" description="Sent to customer after successful order." checked={data.orderConfirmationEnabled} onChange={(v) => onChange("orderConfirmationEnabled", v)} />
      <SettingsToggle title="Shipping Update Email" description="Sent when order status changes to Shipped." checked={data.shippingUpdateEnabled} onChange={(v) => onChange("shippingUpdateEnabled", v)} />
      <SettingsToggle title="Admin Order Alert" description="Notify admin email when a new order is placed." checked={data.adminOrderAlertEnabled} onChange={(v) => onChange("adminOrderAlertEnabled", v)} />
    </SettingsCard>

    <SettingsCard
      title="Test Email Connection"
      description="Send a test email to verify your SMTP configuration is working."
      icon="🔌"
    >
      <div className="settings-test-email-row">
        <div className="settings-field" style={{ flex: 1 }}>
          <label>Recipient Email</label>
          <input type="email" value={testEmailAddress} onChange={(e) => onTestEmailAddressChange(e.target.value)} placeholder="test@example.com" />
        </div>
        <button className="settings-test-email-btn" onClick={onTestEmail} disabled={testLoading} type="button">
          {testLoading ? <span className="settings-save-spinner"></span> : "📤"}
          {testLoading ? "Sending…" : "Send Test Email"}
        </button>
      </div>
    </SettingsCard>
  </>
);

// ─── NOTIFICATIONS TAB ────────────────────────────────────────────────────
export const NotificationsSettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Notification Preferences"
    description="Control which events send admin alerts and notifications."
    icon="🔔"
    onSave={onSave}
    saving={saving}
  >
    <SettingsToggle title="New Order Alert" description="Receive alert when a new order is placed." checked={data.orderPlacedAlert} onChange={(v) => onChange("orderPlacedAlert", v)} />
    <SettingsToggle title="Order Cancellation Alert" description="Receive alert when an order is cancelled." checked={data.orderCancelledAlert} onChange={(v) => onChange("orderCancelledAlert", v)} />
    <SettingsToggle title="New Review Alert" description="Receive alert when a new review is submitted." checked={data.newReviewAlert} onChange={(v) => onChange("newReviewAlert", v)} />
    <SettingsToggle title="New User Registration Alert" description="Receive alert when a new user registers." checked={data.newUserAlert} onChange={(v) => onChange("newUserAlert", v)} />
    <SettingsToggle title="Support Ticket Alert" description="Receive alert when a new support ticket is created." checked={data.supportTicketAlert} onChange={(v) => onChange("supportTicketAlert", v)} />
    <SettingsToggle title="Low Stock Alert" description={`Alert when product stock falls below threshold.`} checked={data.lowStockAlert} onChange={(v) => onChange("lowStockAlert", v)} />

    {data.lowStockAlert && (
      <div className="settings-form-grid" style={{ marginTop: 16 }}>
        <div className="settings-field">
          <label>Low Stock Threshold (units)</label>
          <input type="number" min="1" value={data.lowStockThreshold ?? 10} onChange={(e) => onChange("lowStockThreshold", Number(e.target.value))} />
          <span className="field-hint">Alert when stock drops below this quantity.</span>
        </div>
      </div>
    )}
  </SettingsCard>
);

// ─── SECURITY SETTINGS TAB ────────────────────────────────────────────────
export const SecuritySettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Security Settings"
    description="Configure session timeouts, login attempt limits, and security policies."
    icon="🛡️"
    onSave={onSave}
    saving={saving}
  >
    <div className="settings-form-grid">
      <div className="settings-field">
        <label>Session Timeout (minutes)</label>
        <input type="number" min="5" value={data.sessionTimeoutMinutes ?? 60} onChange={(e) => onChange("sessionTimeoutMinutes", Number(e.target.value))} />
        <span className="field-hint">Admin is logged out after this idle period.</span>
      </div>
      <div className="settings-field">
        <label>Max Login Attempts</label>
        <input type="number" min="3" max="20" value={data.maxLoginAttempts ?? 5} onChange={(e) => onChange("maxLoginAttempts", Number(e.target.value))} />
        <span className="field-hint">Account is locked after this many failed attempts.</span>
      </div>
      <div className="settings-field">
        <label>Account Lockout Duration (minutes)</label>
        <input type="number" min="1" value={data.lockoutDurationMinutes ?? 15} onChange={(e) => onChange("lockoutDurationMinutes", Number(e.target.value))} />
      </div>
    </div>

    <div className="settings-section-divider"></div>
    <SettingsToggle title="Require Email Verification" description="New users must verify their email before accessing the store." checked={data.requireEmailVerification} onChange={(v) => onChange("requireEmailVerification", v)} />

    <div className="settings-section-divider"></div>
    <div className="settings-section-label">Future Ready (Coming Soon)</div>
    <div className="settings-future-stub-row">
      <span className="future-stub-item">🔐 Two-Factor Authentication (2FA)</span>
      <span className="future-stub-badge">Coming Soon</span>
    </div>
    <div className="settings-future-stub-row">
      <span className="future-stub-item">🌐 IP Allowlist for Admin Access</span>
      <span className="future-stub-badge">Coming Soon</span>
    </div>
  </SettingsCard>
);

// ─── APPEARANCE SETTINGS TAB ──────────────────────────────────────────────
export const AppearanceSettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Appearance & Theme"
    description="Customize the admin panel theme, accent color, and layout preferences."
    icon="🎨"
    onSave={onSave}
    saving={saving}
  >
    <div className="settings-section-label">Admin Theme</div>
    <div className="appearance-theme-picker">
      {[
        { key: "dark", label: "Dark Mode", icon: "🌑" },
        { key: "light", label: "Light Mode", icon: "☀️" },
        { key: "luxury", label: "Luxury Dark", icon: "⚜️" },
      ].map((theme) => (
        <button
          key={theme.key}
          className={`theme-picker-btn ${data.adminTheme === theme.key ? "active" : ""}`}
          onClick={() => onChange("adminTheme", theme.key)}
          type="button"
        >
          <span>{theme.icon}</span>
          {theme.label}
          {data.adminTheme === theme.key && <span className="theme-check">✓</span>}
        </button>
      ))}
    </div>

    <div className="settings-section-divider"></div>
    <div className="settings-form-grid">
      <div className="settings-field">
        <label>Accent Color</label>
        <div className="color-picker-row">
          <input type="color" value={data.accentColor || "#7B1E3A"} onChange={(e) => onChange("accentColor", e.target.value)} className="settings-color-swatch" />
          <input type="text" value={data.accentColor || "#7B1E3A"} onChange={(e) => onChange("accentColor", e.target.value)} placeholder="#7B1E3A" className="settings-color-text-input" />
        </div>
        <span className="field-hint">Sets the primary color for buttons, badges, and highlights.</span>
      </div>
    </div>
    <div className="settings-section-divider"></div>
    <SettingsToggle title="Compact Mode" description="Reduce spacing for a denser information layout." checked={data.compactMode} onChange={(v) => onChange("compactMode", v)} />
    <SettingsToggle title="Sidebar Collapsed by Default" description="Start with a collapsed sidebar on load." checked={data.sidebarCollapsed} onChange={(v) => onChange("sidebarCollapsed", v)} />
  </SettingsCard>
);

// ─── MAINTENANCE MODE TAB ─────────────────────────────────────────────────
export const MaintenanceSettingsTab = ({ data, onChange, onSave, saving }) => (
  <SettingsCard
    title="Maintenance Mode"
    description="Enable maintenance mode to take your store offline temporarily."
    icon="🔧"
    onSave={onSave}
    saving={saving}
  >
    <div className={`maintenance-mode-status-banner ${data.enabled ? "active" : "inactive"}`}>
      <span className="maintenance-status-dot"></span>
      Maintenance Mode is currently{" "}
      <strong>{data.enabled ? "ENABLED — Store is Offline" : "DISABLED — Store is Online"}</strong>
    </div>

    <SettingsToggle
      title="Enable Maintenance Mode"
      description="Your storefront will show a maintenance page to all visitors."
      checked={data.enabled}
      onChange={(v) => onChange("enabled", v)}
    />
    <SettingsToggle
      title="Allow Admin Access During Maintenance"
      description="Admins can still browse the store while it's in maintenance mode."
      checked={data.allowAdminAccess}
      onChange={(v) => onChange("allowAdminAccess", v)}
    />

    <div className="settings-form-grid single-col" style={{ marginTop: 16 }}>
      <div className="settings-field">
        <label>Maintenance Message</label>
        <textarea
          value={data.message || ""}
          onChange={(e) => onChange("message", e.target.value)}
          rows={3}
          placeholder="We are currently undergoing maintenance. Please check back soon."
        />
      </div>
      <div className="settings-field">
        <label>Estimated Downtime</label>
        <input type="text" value={data.estimatedDowntime || ""} onChange={(e) => onChange("estimatedDowntime", e.target.value)} placeholder="e.g. 2 hours, Back by 6 PM" />
        <span className="field-hint">Displayed to customers on the maintenance page.</span>
      </div>
    </div>
  </SettingsCard>
);
