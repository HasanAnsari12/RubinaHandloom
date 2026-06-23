import { useNavigate, Link } from "react-router-dom";

import "./Account.css";

function Account() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const wishlist =
    JSON.parse(localStorage.getItem("wishlist")) || [];

  const cart =
    JSON.parse(localStorage.getItem("cart")) || [];

  const orders =
    JSON.parse(localStorage.getItem("orders")) || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="account-page">

      <div className="profile-card">

        <div className="avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

       <h1>
  Welcome Back,
  <br />
  {user?.name}
</h1>

<p>
  {user?.email}
</p>

<p
  style={{
    color: "#7b0f1a",
    fontWeight: "600",
    marginTop: "10px",
  }}
>
  Rubina Handloom Member
</p>

        <span className="member-badge">
          Premium Member
        </span>

      </div>

      <div className="dashboard-grid">

        <Link to="/orders" className="dashboard-card">
          <h3>📦 My Orders</h3>
          <span>{orders.length}</span>
          <p>Track your orders</p>
        </Link>

        <Link to="/wishlist" className="dashboard-card">
          <h3>❤️ Wishlist</h3>
          <span>{wishlist.length}</span>
          <p>Saved products</p>
        </Link>

        <Link to="/cart" className="dashboard-card">
          <h3>🛒 Cart</h3>
          <span>{cart.length}</span>
          <p>Items in cart</p>
        </Link>

        <Link
  to="/account/address"
  className="dashboard-card"
>
  <h3>📍 Address</h3>
  <p>Manage addresses</p>
</Link>

        <Link
  to="/account/edit"
  className="dashboard-card"
>
  <h3>👤 Edit Profile</h3>
  <p>Update account</p>
</Link>

        <Link
  to="/account/password"
  className="dashboard-card"
>
  <h3>🔒 Password</h3>
  <p>Change password</p>
</Link>

      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>
  );
}

export default Account;