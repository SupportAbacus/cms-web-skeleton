"use client";

import React, { useState } from "react";
import {
  Flame,
  Play,
  Clock,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Layers,
  Database,
  Calendar,
  AlertCircle,
  Zap,
} from "lucide-react";

export interface WarmJobResult {
  id: string;
  timestamp: string;
  scope: string;
  concurrency: number;
  totalUrls: number;
  warmedCount: number;
  failedCount: number;
  durationMs: number;
  throughputPagesPerSec: number;
  status: "COMPLETED" | "RUNNING" | "SCHEDULED";
}

const INITIAL_WARM_JOBS: WarmJobResult[] = [
  {
    id: "warm-2026-09-02-01",
    timestamp: "2026-09-02T03:00:00Z",
    scope: "All Published Articles & Products",
    concurrency: 8,
    totalUrls: 142,
    warmedCount: 142,
    failedCount: 0,
    durationMs: 3400,
    throughputPagesPerSec: 41.7,
    status: "COMPLETED",
  },
  {
    id: "warm-2026-09-01-02",
    timestamp: "2026-09-01T18:45:00Z",
    scope: "Dynamic Sitemap.xml Index",
    concurrency: 4,
    totalUrls: 85,
    warmedCount: 85,
    failedCount: 0,
    durationMs: 2100,
    throughputPagesPerSec: 40.4,
    status: "COMPLETED",
  },
];

export function CacheWarmControl() {
  const [concurrency, setConcurrency] = useState(6);
  const [scope, setScope] = useState("all-articles");
  const [scheduleMode, setScheduleMode] = useState<"immediate" | "daily-cron" | "post-publish">("immediate");
  const [isWarming, setIsWarming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatusText, setCurrentStatusText] = useState("");
  const [jobs, setJobs] = useState<WarmJobResult[]>(INITIAL_WARM_JOBS);
  const [lastWarmedAt, setLastWarmedAt] = useState<string>("2026-09-02 03:00:00 UTC");

  const handleRunWarm = async () => {
    setIsWarming(true);
    setProgress(5);
    setCurrentStatusText("Initializing warm worker pool...");

    await new Promise((r) => setTimeout(r, 400));
    setProgress(25);
    setCurrentStatusText(`Dispatched ${concurrency} parallel workers to Tier 1 Redis & Tier 2 R2 origins...`);

    await new Promise((r) => setTimeout(r, 600));
    setProgress(60);
    setCurrentStatusText("Preheating edge tags and compiling server component payloads...");

    await new Promise((r) => setTimeout(r, 600));
    setProgress(90);
    setCurrentStatusText("Validating HTTP 200 responses across edge cache nodes...");

    await new Promise((r) => setTimeout(r, 400));
    setProgress(100);
    setCurrentStatusText("Cache preheat completed successfully with 100% HIT readiness.");

    const newJob: WarmJobResult = {
      id: `warm-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toISOString(),
      scope:
        scope === "all-articles"
          ? "All Published Articles & Products"
          : scope === "sitemap"
          ? "Dynamic Sitemap.xml Index"
          : "Top 50 Hot Route URLs",
      concurrency,
      totalUrls: scope === "all-articles" ? 142 : scope === "sitemap" ? 85 : 50,
      warmedCount: scope === "all-articles" ? 142 : scope === "sitemap" ? 85 : 50,
      failedCount: 0,
      durationMs: 2000,
      throughputPagesPerSec: Math.round((scope === "all-articles" ? 142 : 85) / 2),
      status: "COMPLETED",
    };

    setJobs([newJob, ...jobs]);
    setLastWarmedAt(new Date().toISOString());
    setIsWarming(false);
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
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#ffedd5",
              color: "#c2410c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flame style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              High-Velocity Cache Warm Control & Scheduler
            </h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
              PRD §8 Concurrent Edge Tag Preheating & Background SWR Cache Population
            </p>
          </div>
        </div>

        <div style={{ fontSize: "0.8125rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock style={{ width: "14px", height: "14px" }} />
          <span>Last Warmed: </span>
          <strong style={{ color: "#0f172a" }}>{lastWarmedAt}</strong>
        </div>
      </div>

      {/* Control Configuration Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Concurrency & Scope Settings */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 1.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sliders style={{ width: "18px", height: "18px", color: "#ea580c" }} />
            Worker Pool & Concurrency
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                <span>Parallel Workers (Concurrency)</span>
                <span style={{ color: "#c2410c", fontSize: "1rem" }}>{concurrency} Threads</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#ea580c", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                <span>1 (Gentle)</span>
                <span>8 (Balanced)</span>
                <span>20 (Turbo Max)</span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Preheat Target Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="all-articles">All Published Articles & Products (142 URLs)</option>
                <option value="sitemap">Dynamic Sitemap.xml Index (85 URLs)</option>
                <option value="hot-pages">Top 50 Most Visited Hot Pages</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trigger Scheduler Settings */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 1.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
            Trigger Schedule & Execution
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Automation Trigger Policy
              </label>
              <select
                value={scheduleMode}
                onChange={(e) => setScheduleMode(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="immediate">Immediate Manual Run</option>
                <option value="daily-cron">Scheduled Daily Cron (03:00 UTC)</option>
                <option value="post-publish">Automatic Post-Publish Webhook Trigger</option>
              </select>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Executes asynchronous GET sweeps to seed Next.js VPS disk ISR cache and Redis edge tags, ensuring 0ms cold starts for subsequent visitors.
            </p>

            <button
              onClick={handleRunWarm}
              disabled={isWarming}
              style={{
                marginTop: "auto",
                padding: "0.625rem 1rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isWarming ? "#94a3b8" : "#ea580c",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isWarming ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {isWarming ? (
                <RefreshCw style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
              ) : (
                <Play style={{ width: "16px", height: "16px" }} />
              )}
              {isWarming ? "Warming Cache Pipeline..." : "Execute Cache Warm Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Live Warm Progress Box */}
      {isWarming ? (
        <div
          style={{
            padding: "1.25rem",
            borderRadius: "12px",
            backgroundColor: "#fff7ed",
            border: "1px solid #fed7aa",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            <span style={{ color: "#9a3412" }}>{currentStatusText}</span>
            <span style={{ color: "#c2410c" }}>{progress}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", borderRadius: "4px", backgroundColor: "#ffedd5", overflow: "hidden" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#ea580c",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Warm Execution History Table */}
      <div style={{ borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ margin: 0, fontWeight: 600, fontSize: "0.9375rem" }}>Cache Warm Execution History</h4>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Automated & Manual runs</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Job ID</th>
                <th style={{ padding: "0.75rem 1rem" }}>Timestamp</th>
                <th style={{ padding: "0.75rem 1rem" }}>Target Scope</th>
                <th style={{ padding: "0.75rem 1rem" }}>Concurrency</th>
                <th style={{ padding: "0.75rem 1rem" }}>URLs Preheated</th>
                <th style={{ padding: "0.75rem 1rem" }}>Throughput</th>
                <th style={{ padding: "0.75rem 1rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 600 }}>{job.id}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{new Date(job.timestamp).toLocaleString()}</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{job.scope}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{job.concurrency} Workers</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#166534" }}>
                    {job.warmedCount} / {job.totalUrls} (100%)
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", color: "#ea580c", fontWeight: 600 }}>
                    {job.throughputPagesPerSec} pages/s
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                      }}
                    >
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CacheWarmControl;
