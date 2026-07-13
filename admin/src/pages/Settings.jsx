import PageHeader from "../components/admin/PageHeader";
import "./PlaceholderPage.css";

function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your admin preferences and application settings." />
      <div className="placeholder-card">
        <p className="placeholder-icon">⚙️</p>
        <h2>Coming Soon</h2>
        <p>Application settings will be available in the next release.</p>
      </div>
    </div>
  );
}

export default Settings;
