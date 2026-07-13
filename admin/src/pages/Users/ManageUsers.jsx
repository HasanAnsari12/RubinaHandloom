import { useEffect, useState } from "react";
import api from "../../services/api";
import "./ManageUsers.css";
import { toast } from "react-toastify";
import PageHeader from "../../components/admin/PageHeader";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}><h2>Loading users...</h2></div>;
  }

  return (
    <div className="manage-users-page">
      <PageHeader
        title="Manage Users"
        subtitle="View and manage all registered customers."
      />

      {users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No users found.
        </div>
      ) : (
        <div className="users-table">
          {users.map((user) => (
            <div key={user._id} className="user-row">
              <div className="user-avatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>

              <div className="user-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>

              <div className="user-role">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>

              <div className="user-joined">
                <p>Joined: {new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
              </div>

              <button
                className="delete-user-btn"
                onClick={() => handleDelete(user._id)}
                disabled={user.role === "admin"}
                title={user.role === "admin" ? "Cannot delete admin" : "Delete user"}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
