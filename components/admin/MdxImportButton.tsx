"use client";

import React, { useState } from "react";
import { FileUp } from "lucide-react";
import { MdxImportModal } from "./MdxImportModal";

export function MdxImportButton({ siteKey = "brand-a" }: { siteKey?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#27272a",
          color: "#f4f4f5",
          border: "1px solid #3f3f46",
          borderRadius: "6px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "background-color 0.15s ease",
        }}
        title="Upload .mdx file to parse into blocks"
      >
        <FileUp style={{ width: "14px", height: "14px", color: "#3b82f6" }} />
        <span>Import MDX</span>
      </button>

      <MdxImportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        siteKey={siteKey}
      />
    </>
  );
}
