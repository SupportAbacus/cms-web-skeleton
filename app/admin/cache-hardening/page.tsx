import React from "react";
import type { Metadata } from "next";
import CacheHardeningClient from "./CacheHardeningClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advanced Cache Hardening & Rate Limiting | Payload CMS Admin",
  description: "Manage per-site rate limiting, view real-time cache invalidation audit logs, and configure concurrent cache preheating.",
};

export default function AdminCacheHardeningPage() {
  return <CacheHardeningClient />;
}
