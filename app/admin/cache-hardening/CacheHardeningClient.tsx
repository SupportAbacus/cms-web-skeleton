"use client";

import React, { useState } from "react";
import {
  RateLimitDisplayPanel,
  CacheAuditLogViewer,
  CacheWarmControl,
} from "@/components/admin";
import { Gauge, FileText, Flame } from "lucide-react";

export default function CacheHardeningClient() {
  const [activeTab, setActiveTab] = useState<"rate-limit" | "audit-log" | "warm-control">("rate-limit");

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Advanced Cache Hardening & Rate Limiting Console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              PRD §8 Per-Site Traffic Policies, Cache Audit Event Stream & High-Velocity Preheating
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border/40 text-sm font-medium">
            <button
              onClick={() => setActiveTab("rate-limit")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === "rate-limit"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gauge className="h-4 w-4 text-amber-500" />
              <span>Rate Limits & Cooldown</span>
            </button>

            <button
              onClick={() => setActiveTab("audit-log")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === "audit-log"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4 text-slate-700" />
              <span>Cache Audit Logs</span>
            </button>

            <button
              onClick={() => setActiveTab("warm-control")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === "warm-control"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Preheat & Scheduler</span>
            </button>
          </div>
        </div>

        {/* Tab Viewport */}
        <div>
          {activeTab === "rate-limit" && <RateLimitDisplayPanel />}
          {activeTab === "audit-log" && <CacheAuditLogViewer />}
          {activeTab === "warm-control" && <CacheWarmControl />}
        </div>
      </div>
    </div>
  );
}
