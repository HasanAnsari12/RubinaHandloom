import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout-wrapper">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="admin-layout-main">
        {/* Top bar header */}
        <Topbar />

        {/* Dynamic page contents */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
