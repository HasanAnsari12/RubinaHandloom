// frontend/src/pages/AdminOrders.jsx

import "./AdminOrders.css";

function AdminOrders() {
  // Temporary demo data
  const orders = [
    {
      id: "ORD-102341",
      customer: "Priya Sharma",
      total: 4999,
      status: "Pending",
      items: 2,
      date: "16 May 2026",
    },
    {
      id: "ORD-102342",
      customer: "Anjali Verma",
      total: 8999,
      status: "Shipped",
      items: 1,
      date: "15 May 2026",
    },
    {
      id: "ORD-102343",
      customer: "Neha Kapoor",
      total: 12499,
      status: "Delivered",
      items: 3,
      date: "14 May 2026",
    },
  ];

  return (
    <div className="admin-orders-page">
      {/* Header */}
      <div className="admin-orders-header">
        <h1>Manage Orders</h1>
        <p>
          Track and update customer orders.
        </p>
      </div>

      {/* Orders Table */}
      <div className="orders-table">
        {orders.map((order) => (
          <div
            key={order.id}
            className="order-row"
          >
            <div>
              <h3>{order.id}</h3>
              <p>{order.customer}</p>
            </div>

            <div>
              <p>{order.items} items</p>
              <p>{order.date}</p>
            </div>

            <div>
              <strong>₹{order.total}</strong>
            </div>

            <select
              defaultValue={order.status}
              className={`status-select ${order.status.toLowerCase()}`}
            >
              <option>Pending</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrders;