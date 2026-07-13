import PageHeader from "../../components/admin/PageHeader";
import "../PlaceholderPage.css";

function ManageReviews() {
  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate and manage product reviews." />
      <div className="placeholder-card">
        <p className="placeholder-icon">⭐</p>
        <h2>Coming Soon</h2>
        <p>Review management will be available in the next release.</p>
      </div>
    </div>
  );
}

export default ManageReviews;
