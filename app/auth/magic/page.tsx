import React from "react";
import type { Metadata } from "next";
import MagicAuthClient from "./MagicAuthClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Magic Link Authentication | Payload CMS",
  description: "Single-use ephemeral developer access grant exchange.",
};

export default function MagicAuthPage() {
  return <MagicAuthClient />;
}
