import React from "react";
import StatCard from "./StatCard";
import "./UserStats.css";

const UserStats = ({ users = [] }) => {
  const total = users.length;
  const active = users.filter((u) => !u.isBlocked).length;
  const blocked = users.filter((u) => u.isBlocked).length;
  const admins = users.filter((u) => u.role === "admin").length;
  const customers = users.filter((u) => u.role === "user").length;
  const verified = users.filter((u) => u.isVerified).length;
  const unverified = users.filter((u) => !u.isVerified).length;

  return (
    <div className="user-stats-deck">
      <StatCard title="Total Users" value={total} icon="👥" subtitle="registered profiles" />
      <StatCard title="Active" value={active} icon="🟢" trend="positive" subtitle="active logins" />
      <StatCard title="Blocked" value={blocked} icon="🔴" trend={blocked > 0 ? "negative" : "positive"} subtitle="restricted profiles" />
      <StatCard title="Admins" value={admins} icon="👑" subtitle="super admin role" />
      <StatCard title="Customers" value={customers} icon="🛒" subtitle="standard accounts" />
      <StatCard title="Verified" value={verified} icon="✔️" trend="positive" subtitle="email verified" />
      <StatCard title="Unverified" value={unverified} icon="⚠️" trend={unverified > 0 ? "neutral" : "positive"} subtitle="verification pending" />
    </div>
  );
};

export default UserStats;
