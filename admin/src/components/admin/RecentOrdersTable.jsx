import React from "react";
import "./RecentOrdersTable.css";

const RecentOrdersTable = ({ orders = [] }) => {
  return (
    <div className="luxury-table-container">
      <table className="luxury-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Payment</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="7" className="table-empty-row">
                No recent orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const statusClass = (order.orderStatus || "Pending").toLowerCase();
              const paymentStatus = order.paymentInfo?.status || "Unpaid";
              return (
                <tr key={order._id}>
                  <td className="order-id-cell">
                    #{String(order._id).slice(-8).toUpperCase()}
                  </td>
                  <td>
                    <div className="customer-info-cell">
                      <span className="customer-avatar-letter">
                        {order.user?.name?.[0]?.toUpperCase() || "C"}
                      </span>
                      <div>
                        <div className="customer-name">{order.user?.name || "Customer"}</div>
                        <div className="customer-email">{order.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-date-cell">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className={`payment-badge ${paymentStatus.toLowerCase()}`}>
                      {paymentStatus}
                    </span>
                  </td>
                  <td className="table-amount-cell">
                    ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>
                      {order.orderStatus || "Pending"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="table-view-btn" onClick={() => alert(`View Order Details for #${order._id}`)}>
                      View Detail
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersTable;
