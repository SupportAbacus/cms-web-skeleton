import React from "react";
import type { Metadata } from "next";
import HardeningClient from "./HardeningClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hardening & Disaster Recovery (DR) | Payload CMS Admin",
  description: "Enterprise hardening, off-server encrypted backup drills, CMS kill-switch, and magic link self-service generator.",
};

export default function AdminHardeningPage() {
  return <HardeningClient />;
}
