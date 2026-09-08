"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Filter,
  Search,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Flame,
} from "lucide-react";

export interface CacheLogEntry {
  id: string;
  timestamp: string;
  siteKey: string;
  eventType: "HIT" | "MISS" | "PURGE" | "EVICTION" | "WARM" | "STALE";
  path: string;
  latencyMs: number;
  sizeBytes: number;
  tier: "Tier 1 (Redis)" | "Tier 2 (R2)" | "Next.js ISR";
  initiator: string;
}

const INITIAL_CACHE_LOGS: CacheLogEntry[] = [
  {
    id: "log-901",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    siteKey: "brand-a",
    eventType: "HIT",
    path: "/blog",
    latencyMs: 1.2,
    sizeBytes: 64200,
    tier: "Tier 1 (Redis)",
    initiator: "Visitor Request",
  },
  {
    id: "log-902",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    siteKey: "brand-a",
    eventType: "PURGE",
    path: "cms:brand-a:blog:*",
    latencyMs: 14.5,
    sizeBytes: 0,
    tier: "Next.js ISR",
    initiator: "Webhook: post.published",
  },
  {
    id: "log-903",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    siteKey: "brand-b",
    eventType: "WARM",
    path: "/product/enterprise-headless-suite",
    latencyMs: 28.0,
    sizeBytes: 81200,
    tier: "Tier 2 (R2)",
    initiator: "Background Warm Worker",
  },
  {
    id: "log-904",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    siteKey: "brand-a",
    eventType: "MISS",
    path: "/api/v1/content/blog?limit=10",
    latencyMs: 45.2,
    sizeBytes: 12400,
    tier: "Tier 1 (Redis)",
    initiator: "API Crawler",
  },
  {
    id: "log-905",
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    siteKey: "brand-b",
    eventType: "EVICTION",
    path: "cms:brand-b:old-draft-preview",
    latencyMs: 0.8,
    sizeBytes: 0,
    tier: "Tier 1 (Redis)",
    initiator: "LRU Auto-Pruner",
  },
  {
    id: "log-906",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    siteKey: "brand-a",
    eventType: "STALE",
    path: "/blog",
    latencyMs: 4.1,
    sizeBytes: 42100,
    tier: "Next.js ISR",
    initiator: "Edge SWR Trigger",
  },
];

export function CacheAuditLogViewer() {
  const [logs, setLogs] = useState<CacheLogEntry[]>(INITIAL_CACHE_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
      // Search match
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesPath = log.path.toLowerCase().includes(q);
        const matchesInitiator = log.initiator.toLowerCase().includes(q);
        if (!matchesPath && !matchesInitiator) return false;
      }

      // Site filter
      if (siteFilter !== "all" && log.siteKey !== siteFilter) return false;

      // Event type filter
      if (eventTypeFilter !== "all" && log.eventType !== eventTypeFilter) return false;

      // Time range filter
      if (timeRangeFilter !== "all") {
        const logTime = new Date(log.timestamp).getTime();
        const diffMinutes = (now - logTime) / (1000 * 60);
        if (timeRangeFilter === "15m" && diffMinutes > 15) return false;
        if (timeRangeFilter === "1h" && diffMinutes > 60) return false;
        if (timeRangeFilter === "24h" && diffMinutes > 1440) return false;
      }

      return true;
    });
  }, [logs, searchQuery, siteFilter, eventTypeFilter, timeRangeFilter]);

  const handleExportCsv = () => {
    const headers = ["Log ID", "Timestamp", "Site", "Event Type", "Target Path", "Latency (ms)", "Size (Bytes)", "Cache Tier", "Initiator"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.siteKey,
      l.eventType,
      `"${l.path.replace(/"/g, '""')}"`,
      l.latencyMs.toString(),
      l.sizeBytes.toString(),
      `"${l.tier}"`,
      `"${l.initiator.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cache-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
  };

  const getEventBadgeStyle = (eventType: CacheLogEntry["eventType"]) => {
    switch (eventType) {
      case "HIT":
        return { backgroundColor: "#dcfce7", color: "#166534" };
      case "MISS":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "PURGE":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "EVICTION":
        return { backgroundColor: "#f1f5f9", color: "#475569" };
      case "WARM":
        return { backgroundColor: "#e0e7ff", color: "#3730a3" };
      case "STALE":
        return { backgroundColor: "#ffedd5", color: "#9a3412" };
    }
  };

  return (
    <div style={{ fontFamily: "inherit", color: "#0f172a", maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              Cache Invalidation & Event Audit Log
            </h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
              PRD §8 Edge Tag Purges, Cache Hits, Evictions, and Warm Events Audit Trail
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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

          <button
            onClick={handleExportCsv}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            Export CSV ({filteredLogs.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          marginBottom: "1.5rem",
        }}
      >
        {/* Search */}
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <Search style={{ position: "absolute", left: "10px", top: "10px", width: "16px", height: "16px", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by path or initiator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 2.25rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Site Filter */}
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "0.875rem",
            backgroundColor: "#ffffff",
            fontWeight: 500,
          }}
        >
          <option value="all">All Sites</option>
          <option value="brand-a">Site: brand-a</option>
          <option value="brand-b">Site: brand-b</option>
        </select>

        {/* Event Type Filter */}
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "0.875rem",
            backgroundColor: "#ffffff",
            fontWeight: 500,
          }}
        >
          <option value="all">All Event Types</option>
          <option value="HIT">HIT (Cache Serves)</option>
          <option value="MISS">MISS (Origin Fetches)</option>
          <option value="PURGE">PURGE (Invalidations)</option>
          <option value="WARM">WARM (Preheats)</option>
          <option value="EVICTION">EVICTION (LRU Drops)</option>
          <option value="STALE">STALE (SWR Revalidations)</option>
        </select>

        {/* Time Range Filter */}
        <select
          value={timeRangeFilter}
          onChange={(e) => setTimeRangeFilter(e.target.value)}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "0.875rem",
            backgroundColor: "#ffffff",
            fontWeight: 500,
          }}
        >
          <option value="all">All Time</option>
          <option value="15m">Last 15 Minutes</option>
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
        </select>
      </div>

      {/* Log Table */}
      <div style={{ borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Timestamp</th>
                <th style={{ padding: "0.75rem 1rem" }}>Site</th>
                <th style={{ padding: "0.75rem 1rem" }}>Event</th>
                <th style={{ padding: "0.75rem 1rem" }}>Target Path / Tag</th>
                <th style={{ padding: "0.75rem 1rem" }}>Latency</th>
                <th style={{ padding: "0.75rem 1rem" }}>Cache Tier</th>
                <th style={{ padding: "0.75rem 1rem" }}>Initiator</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#0f172a" }}>{entry.siteKey}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          ...getEventBadgeStyle(entry.eventType),
                        }}
                      >
                        {entry.eventType}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.8125rem", color: "#0f172a" }}>
                      {entry.path}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.8125rem", color: "#059669", fontWeight: 600 }}>
                      {entry.latencyMs} ms
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#475569", fontSize: "0.8125rem" }}>{entry.tier}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.8125rem" }}>{entry.initiator}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                    No cache audit logs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CacheAuditLogViewer;
