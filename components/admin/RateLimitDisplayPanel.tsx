"use client";

import React, { useState } from "react";
import {
  Gauge,
  Activity,
  Lock,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Globe,
} from "lucide-react";

export interface RateLimitTier {
  id: string;
  name: string;
  scope: string;
  limitPerMinute: number;
  burstAllowance: number;
  currentUsage: number;
  blockedCount: number;
  cooldownActive: boolean;
  cooldownRemainingSeconds: number;
}

const INITIAL_SITE_TIERS: Record<string, RateLimitTier[]> = {
  "brand-a": [
    {
      id: "public-delivery",
      name: "Public Delivery API (/api/v1/*)",
      scope: "Per IP",
      limitPerMinute: 100,
      burstAllowance: 150,
      currentUsage: 42,
      blockedCount: 0,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    },
    {
      id: "authenticated-bearer",
      name: "Authenticated Bearer Endpoints",
      scope: "Per Token",
      limitPerMinute: 500,
      burstAllowance: 750,
      currentUsage: 118,
      blockedCount: 0,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    },
    {
      id: "form-submission",
      name: "Inbound Form Submissions",
      scope: "Per IP + Honeypot",
      limitPerMinute: 20,
      burstAllowance: 30,
      currentUsage: 4,
      blockedCount: 1,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    },
    {
      id: "magic-auth",
      name: "Magic Link Generation & Verification",
      scope: "Per Email / IP",
      limitPerMinute: 10,
      burstAllowance: 15,
      currentUsage: 2,
      blockedCount: 0,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    },
  ],
  "brand-b": [
    {
      id: "public-delivery",
      name: "Public Delivery API (/api/v1/*)",
      scope: "Per IP",
      limitPerMinute: 100,
      burstAllowance: 150,
      currentUsage: 89,
      blockedCount: 3,
      cooldownActive: true,
      cooldownRemainingSeconds: 14,
    },
    {
      id: "authenticated-bearer",
      name: "Authenticated Bearer Endpoints",
      scope: "Per Token",
      limitPerMinute: 500,
      burstAllowance: 750,
      currentUsage: 240,
      blockedCount: 0,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    },
    {
      id: "form-submission",
      name: "Inbound Form Submissions",
      scope: "Per IP + Honeypot",
      limitPerMinute: 20,
      burstAllowance: 30,
      currentUsage: 8,
      blockedCount: 0,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    },
    {
      id: "magic-auth",
      name: "Magic Link Generation & Verification",
      scope: "Per Email / IP",
      limitPerMinute: 10,
      burstAllowance: 15,
      currentUsage: 1,
      blockedCount: 0,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    },
  ],
};

export function RateLimitDisplayPanel() {
  const [selectedSite, setSelectedSite] = useState<string>("brand-a");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tiers: RateLimitTier[] = INITIAL_SITE_TIERS[selectedSite] ?? INITIAL_SITE_TIERS["brand-a"] ?? [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
  };

  return (
    <div style={{ fontFamily: "inherit", color: "#0f172a", maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#fef3c7",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Gauge style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              API Rate Limiting & Cooldown Monitor
            </h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
              PRD §8 Per-Site Traffic Policies, Burst Allowances, and IP Penalty Status
            </p>
          </div>
        </div>

        {/* Site Switcher & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Globe style={{ width: "16px", height: "16px", color: "#64748b" }} />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: "#ffffff",
                cursor: "pointer",
              }}
            >
              <option value="brand-a">Site: brand-a</option>
              <option value="brand-b">Site: brand-b</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: "0.5rem 0.875rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: isRefreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <RefreshCw style={{ width: "14px", height: "14px", animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ padding: "1.25rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Global Public Base Limit</span>
            <Lock style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>100 req/min</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
            Sliding 60-second window per IP
          </div>
        </div>

        <div style={{ padding: "1.25rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Burst Allowance Cap</span>
            <Zap style={{ width: "18px", height: "18px", color: "#eab308" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>150% Peak</div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.25rem", fontWeight: 500 }}>
            Up to 150 req/min sustained peak
          </div>
        </div>

        <div style={{ padding: "1.25rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Penalty Cooldown State</span>
            <Clock style={{ width: "18px", height: "18px", color: "#8b5cf6" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: selectedSite === "brand-b" ? "#dc2626" : "#16a34a" }}>
            {selectedSite === "brand-b" ? "1 IP Throttled" : "NORMAL"}
          </div>
          <div style={{ fontSize: "0.75rem", color: selectedSite === "brand-b" ? "#dc2626" : "#16a34a", marginTop: "0.25rem", fontWeight: 500 }}>
            {selectedSite === "brand-b" ? "Automatic 60s cooldown in effect" : "0 active IP bans or rate penalties"}
          </div>
        </div>

        <div style={{ padding: "1.25rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Rate Enforcement Engine</span>
            <Activity style={{ width: "18px", height: "18px", color: "#10b981" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>In-Memory LRU</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
            Zero-Redis failover resilience
          </div>
        </div>
      </div>

      {/* Tier Usage Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {tiers.map((tier) => {
          const usagePercent = Math.min(100, Math.round((tier.currentUsage / tier.limitPerMinute) * 100));
          const isHigh = usagePercent >= 80;

          return (
            <div
              key={tier.id}
              style={{
                padding: "1.5rem",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                border: tier.cooldownActive ? "2px solid #ef4444" : "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>{tier.name}</h4>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Scope: {tier.scope}</span>
                </div>
                {tier.cooldownActive ? (
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <AlertTriangle style={{ width: "12px", height: "12px" }} />
                    Cooldown ({tier.cooldownRemainingSeconds}s)
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                    Normal
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
                  <span style={{ color: "#64748b" }}>Current Consumption</span>
                  <span style={{ fontWeight: 600, color: isHigh ? "#dc2626" : "#0f172a" }}>
                    {tier.currentUsage} / {tier.limitPerMinute} req/min ({usagePercent}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", borderRadius: "4px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${usagePercent}%`,
                      height: "100%",
                      backgroundColor: isHigh ? "#ef4444" : "#3b82f6",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Metrics Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8125rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Burst Cap: </span>
                  <strong style={{ color: "#0f172a" }}>{tier.burstAllowance} req/min</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Blocked Hits: </span>
                  <strong style={{ color: tier.blockedCount > 0 ? "#dc2626" : "#0f172a" }}>{tier.blockedCount}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RateLimitDisplayPanel;
