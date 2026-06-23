// frontend/src/pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { getDashboardStats } from "../services/adminService";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      title: "Total Products",
      value: "0",
      icon: "🛍️",
    },
    {
      title: "Total Orders",
      value: "0",
      icon: "📦",
    },
    {
      title: "Total Users",
      value: "0",
      icon: "👥",
    },
    {
      title: "Revenue",
      value: "₹0",
      icon: "💰",
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();

        setStats([
          {
            title: "Total Products",
            value: data.totalProducts,
            icon: "🛍️",
          },
          {
            title: "Total Orders",
            value: data.totalOrders,
            icon: "📦",
          },
          {
            title: "Total Users",
            value: data.totalUsers,
            icon: "👥",
          },
          {
            title: "Revenue",
            value: `₹${data.revenue}`,
            icon: "💰",
          },
        ]);
      } catch (error) {
        console.error(error);
        toast.error(
  "Failed to update product."
);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <h1 style={{ padding: "40px" }}>
        Loading dashboard...
      </h1>
    );
  }

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>

        <nav>
          <a href="/admin/add-product">Add Product</a>
          <a href="/admin/products">Manage Products</a>
          <a href="/admin/orders">Manage Orders</a>
          <a href="/admin/users">User Management</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Dashboard Overview</h1>
          <p>
            Manage your Rubina Handloom store
            efficiently.
          </p>
        </header>

        {/* Stats Cards */}
        <section className="stats-grid">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="stat-card"
            >
              <div className="stat-icon">
                {stat.icon}
              </div>
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Welcome Card */}
        <section className="welcome-card">
          <h2>Welcome, Admin</h2>
          <p>
            From this dashboard, you can manage
            products, orders, users, and monitor
            your business growth.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;