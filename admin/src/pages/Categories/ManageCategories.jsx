import PageHeader from "../../components/admin/PageHeader";
import "../PlaceholderPage.css";

function ManageCategories() {
  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage product categories and classifications." />
      <div className="placeholder-card">
        <p className="placeholder-icon">🗂️</p>
        <h2>Coming Soon</h2>
        <p>Category management will be available in the next release.</p>
      </div>
    </div>
  );
}

export default ManageCategories;
