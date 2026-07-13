import { useEffect, useState } from "react";
import api from "../../services/api";
import "./ManageOrders.css";
import { toast } from "react-toastify";
import PageHeader from "../../components/admin/PageHeader";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated.");
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}><h2>Loading orders...</h2></div>;
  }

  return (
    <div className="manage-orders-page">
      <PageHeader
        title="Manage Orders"
        subtitle="Track and update customer orders."
      />

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No orders found yet.
        </div>
      ) : (
        <div className="orders-table">
          {orders.map((order) => (
            <div key={order._id} className="order-row">
              <div className="order-info">
                <h3>#{String(order._id).slice(-8).toUpperCase()}</h3>
                <p>{order.user?.name || "Customer"}</p>
              </div>

              <div className="order-details">
                <p>{order.orderItems?.length || 0} item(s)</p>
                <p>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
              </div>

              <div className="order-total">
                <strong>₹{order.totalPrice}</strong>
              </div>

              <select
                value={order.orderStatus || "Pending"}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className={`status-select ${(order.orderStatus || "Pending").toLowerCase()}`}
              >
                <option>Pending</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageOrders;
