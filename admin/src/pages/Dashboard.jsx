import { useEffect, useState } from "react";
import "./Dashboard.css";
import { getDashboardStats } from "../services/adminService";
import { toast } from "react-toastify";
import PageHeader from "../components/admin/PageHeader";

function Dashboard() {
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
        toast.error("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h2>Loading metrics...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-page-wrapper">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Track and manage your Rubina Handloom business operations."
      />

      {/* Stats Cards */}
      <section className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Welcome Card */}
      <section className="welcome-card">
        <h2>Welcome to Admin Management Console</h2>
        <p>
          Select an option from the sidebar to manage saree inventories, check client orders, modify user roles, or import bulk product csv files.
        </p>
      </section>
    </div>
  );
}

export default Dashboard;
