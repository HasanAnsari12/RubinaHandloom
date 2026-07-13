import PageHeader from "../components/admin/PageHeader";
import "./PlaceholderPage.css";

function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Sales charts, traffic data, and business insights." />
      <div className="placeholder-card">
        <p className="placeholder-icon">📊</p>
        <h2>Coming Soon</h2>
        <p>Analytics & reporting charts will be available in the next release.</p>
      </div>
    </div>
  );
}

export default Analytics;
