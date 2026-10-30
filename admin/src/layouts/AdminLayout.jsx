import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="luxury-layout-wrapper">
      {/* Navigation Sidebar Drawer */}
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Content Body Frame */}
      <div className="luxury-layout-main">
        {/* Sticky Header Topbar */}
        <Topbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />

        {/* Dynamic Inner Pages Outlet */}
        <main className="luxury-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
