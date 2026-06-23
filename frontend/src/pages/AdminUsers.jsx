// frontend/src/pages/AdminUsers.jsx

import "./AdminUsers.css";

function AdminUsers() {
  // Temporary demo data
  const users = [
    {
      id: 1,
      name: "Hasan Ansari",
      email: "hasan@example.com",
      role: "Admin",
      joined: "16 May 2026",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "Customer",
      joined: "14 May 2026",
    },
    {
      id: 3,
      name: "Anjali Verma",
      email: "anjali@example.com",
      role: "Customer",
      joined: "12 May 2026",
    },
  ];

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="admin-users-header">
        <h1>User Management</h1>
        <p>
          View registered users and their roles.
        </p>
      </div>

      {/* Users Table */}
      <div className="users-table">
        {users.map((user) => (
          <div
            key={user.id}
            className="user-row"
          >
            <div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>

            <div>
              <span
                className={`role-badge ${user.role.toLowerCase()}`}
              >
                {user.role}
              </span>
            </div>

            <div>
              <p>{user.joined}</p>
            </div>

            <button className="view-btn">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminUsers;