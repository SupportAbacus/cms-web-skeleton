"use client";

import React from "react";
import { WebhookSettingsPanel, TwoTierCacheControl, RevalidateInspector } from "@/components/admin";

export default function PublishingSettingsClient() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Publishing Pipeline & Cache Architecture</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Enterprise HMAC-signed webhook dispatchers, dual-tier cache warming (Tier 1 Redis / Tier 2 R2 + ISR), and live edge inspection.
          </p>
        </div>

        <section className="space-y-4">
          <TwoTierCacheControl siteKey="brand-a" />
        </section>

        <section className="space-y-4">
          <RevalidateInspector siteKey="brand-a" />
        </section>

        <section className="space-y-4">
          <WebhookSettingsPanel siteKey="brand-a" />
        </section>
      </div>
    </main>
  );
}
