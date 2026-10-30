import React from "react";
import SettingsCard from "./SettingsCard";
import "./SettingsCard.css";
import "./SystemInfoTab.css";

const InfoRow = ({ label, value, valueClass = "" }) => (
  <div className="sysinfo-row">
    <span className="sysinfo-label">{label}</span>
    <span className={`sysinfo-value ${valueClass}`}>{value ?? "—"}</span>
  </div>
);

const SystemInfoTab = ({ sysInfo, loading }) => {
  if (loading) {
    return (
      <div className="sysinfo-loading">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sysinfo-skeleton-row"></div>
        ))}
      </div>
    );
  }

  if (!sysInfo) return null;

  const memPercent = sysInfo.totalMemoryMB
    ? Math.round((sysInfo.usedMemoryMB / sysInfo.totalMemoryMB) * 100)
    : 0;

  return (
    <>
      <SettingsCard title="Application" description="Current runtime and application version details." icon="🖥️">
        <div className="sysinfo-grid">
          <InfoRow label="App Version" value={sysInfo.appVersion} />
          <InfoRow label="Environment" value={sysInfo.environment} valueClass={sysInfo.environment === "production" ? "badge-green" : "badge-yellow"} />
          <InfoRow label="Node.js Version" value={sysInfo.nodeVersion} />
          <InfoRow label="Platform" value={`${sysInfo.platform} (${sysInfo.arch})`} />
          <InfoRow label="Server Uptime" value={sysInfo.uptimeFormatted} />
          <InfoRow label="Started At" value={sysInfo.startedAt ? new Date(sysInfo.startedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : "—"} />
        </div>
      </SettingsCard>

      <SettingsCard title="Database" description="MongoDB connection and database details." icon="🗄️">
        <div className="sysinfo-grid">
          <InfoRow
            label="DB Status"
            value={sysInfo.dbStatus}
            valueClass={sysInfo.dbStatus === "Connected" ? "badge-green" : "badge-red"}
          />
          <InfoRow label="Database Name" value={sysInfo.dbName} />
        </div>
      </SettingsCard>

      <SettingsCard title="Server Resources" description="Memory and CPU usage on the host machine." icon="📊">
        <div className="sysinfo-grid">
          <InfoRow label="CPU Cores" value={sysInfo.cpuCores} />
          <InfoRow label="Total Memory" value={`${sysInfo.totalMemoryMB} MB`} />
          <InfoRow label="Used Memory" value={`${sysInfo.usedMemoryMB} MB`} />
          <InfoRow label="Free Memory" value={`${sysInfo.freeMemoryMB} MB`} />
          <InfoRow label="Heap Used" value={`${sysInfo.heapUsedMB} MB`} />
          <InfoRow label="Heap Total" value={`${sysInfo.heapTotalMB} MB`} />
        </div>

        {/* Memory Usage Progress Bar */}
        <div className="sysinfo-mem-bar-wrap">
          <div className="sysinfo-mem-bar-label">
            <span>Memory Usage</span>
            <span>{memPercent}%</span>
          </div>
          <div className="sysinfo-mem-bar-track">
            <div
              className="sysinfo-mem-bar-fill"
              style={{
                width: `${memPercent}%`,
                backgroundColor: memPercent > 80 ? "#DC2626" : memPercent > 60 ? "#D97706" : "#16A34A",
              }}
            ></div>
          </div>
        </div>
      </SettingsCard>
    </>
  );
};

export default SystemInfoTab;
