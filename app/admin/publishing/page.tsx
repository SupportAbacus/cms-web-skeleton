import React from "react";
import type { Metadata } from "next";
import PublishingSettingsClient from "./PublishingSettingsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publishing & Two-Tier Cache Settings | Payload CMS Admin",
  description: "Manage publishing webhooks, dual-tier cache warming, and live ISR edge status inspection.",
};

export default function AdminPublishingPage() {
  return <PublishingSettingsClient />;
}
