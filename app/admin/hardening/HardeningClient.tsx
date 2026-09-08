"use client";

import React, { useState } from "react";
import {
  DisasterRecoveryPanel,
  MagicLinkGeneratorPanel,
  CacheWebhookStatusDashboard,
} from "@/components/admin";
import { ShieldCheck, KeyRound, Activity } from "lucide-react";

export default function HardeningClient() {
  const [activeTab, setActiveTab] = useState<"dr" | "magic" | "validation">("dr");

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Production Hardening & Disaster Recovery Console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              PRD §7 & §9.5 Zero-Downtime Resilience, Ephemeral Access Grants & Edge Cache Health
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border/40 text-sm font-medium">
            <button
              onClick={() => setActiveTab("dr")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === "dr"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <span>DR Drill & Kill Switch</span>
            </button>

            <button
              onClick={() => setActiveTab("magic")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === "magic"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="h-4 w-4 text-indigo-500" />
              <span>Magic Links</span>
            </button>

            <button
              onClick={() => setActiveTab("validation")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === "validation"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Pipeline Health</span>
            </button>
          </div>
        </div>

        {/* Tab Viewport */}
        <div>
          {activeTab === "dr" && <DisasterRecoveryPanel />}
          {activeTab === "magic" && <MagicLinkGeneratorPanel />}
          {activeTab === "validation" && <CacheWebhookStatusDashboard />}
        </div>
      </div>
    </div>
  );
}
