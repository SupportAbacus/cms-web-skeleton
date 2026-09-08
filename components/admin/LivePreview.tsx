"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Eye,
  WifiOff,
  Sparkles,
} from "lucide-react";

export type ViewportMode = "desktop" | "tablet" | "mobile";

export interface LivePreviewProps {
  initialUrl?: string;
  siteKey?: string;
  contentType?: string;
  slug?: string;
  draftToken?: string | null;
  documentData?: Record<string, any>;
  className?: string;
}

export function LivePreview({
  initialUrl,
  siteKey = process.env.NEXT_PUBLIC_SITE_KEY || "brand-a",
  contentType = "blog",
  slug = "",
  draftToken,
  documentData,
  className = "",
}: LivePreviewProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [scale, setScale] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Compute live preview URL (draft token contract)
  const baseUrl =
    initialUrl ||
    (typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_PREVIEW_BASE || "http://localhost:3000"
      : "http://localhost:3000");

  const previewPath = draftToken
    ? `/api/draft?secret=${draftToken}&siteKey=${siteKey}&type=${contentType}&slug=${slug}`
    : `/${contentType}/${slug}`;

  const fullPreviewUrl = `${baseUrl.replace(/\/$/, "")}${previewPath}`;

  // Send real-time document data updates to iframe via postMessage
  useEffect(() => {
    if (iframeRef.current && documentData) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          {
            type: "CMS_DRAFT_UPDATE",
            siteKey,
            contentType,
            slug,
            data: documentData,
          },
          "*"
        );
      } catch {
        // ignore cross-origin postMessage restriction
      }
    }
  }, [documentData, siteKey, contentType, slug]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = fullPreviewUrl;
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullPreviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const viewportStyles: Record<ViewportMode, { width: string; height: string }> = {
    desktop: { width: "100%", height: "100%" },
    tablet: { width: "768px", height: "1024px" },
    mobile: { width: "375px", height: "812px" },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "650px",
        backgroundColor: "#09090b",
        color: "#f4f4f5",
        borderRadius: "12px",
        border: "1px solid #27272a",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className={className}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "#18181b",
          borderBottom: "1px solid #27272a",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Viewport Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#27272a",
              borderRadius: "8px",
              padding: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: viewport === "desktop" ? "#3f3f46" : "transparent",
                color: viewport === "desktop" ? "#fff" : "#a1a1aa",
                transition: "all 0.15s ease",
              }}
              title="Desktop View (100%)"
            >
              <Monitor style={{ width: "14px", height: "14px" }} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: viewport === "tablet" ? "#3f3f46" : "transparent",
                color: viewport === "tablet" ? "#fff" : "#a1a1aa",
                transition: "all 0.15s ease",
              }}
              title="Tablet View (768px)"
            >
              <Tablet style={{ width: "14px", height: "14px" }} />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: viewport === "mobile" ? "#3f3f46" : "transparent",
                color: viewport === "mobile" ? "#fff" : "#a1a1aa",
                transition: "all 0.15s ease",
              }}
              title="Mobile View (375px)"
            >
              <Smartphone style={{ width: "14px", height: "14px" }} />
              <span>Mobile</span>
            </button>
          </div>

          {/* Zoom scale select */}
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            style={{
              backgroundColor: "#27272a",
              color: "#d4d4d8",
              border: "1px solid #3f3f46",
              borderRadius: "6px",
              padding: "5px 8px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
          </select>
        </div>

        {/* Center: Live URL Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#09090b",
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "12px",
            color: "#a1a1aa",
            border: "1px solid #27272a",
            maxWidth: "350px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: isOffline ? "#ef4444" : "#10b981",
            }}
          />
          <span style={{ fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>
            {fullPreviewUrl}
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              backgroundColor: "#27272a",
              color: "#e4e4e7",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            title="Reload Preview"
          >
            <RotateCw
              style={{
                width: "14px",
                height: "14px",
                animation: isLoading ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              backgroundColor: "#27272a",
              color: "#e4e4e7",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            title="Copy Preview URL"
          >
            {copied ? (
              <Check style={{ width: "14px", height: "14px", color: "#10b981" }} />
            ) : (
              <Copy style={{ width: "14px", height: "14px" }} />
            )}
          </button>
          <a
            href={fullPreviewUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <span>Open Tab</span>
            <ExternalLink style={{ width: "12px", height: "12px" }} />
          </a>
        </div>
      </div>

      {/* Offline / Draft endpoint fallback notice if error */}
      {isOffline && (
        <div
          style={{
            backgroundColor: "#7f1d1d",
            color: "#fecaca",
            padding: "8px 16px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <WifiOff style={{ width: "14px", height: "14px" }} />
          <span>
            Draft mode endpoint is unreachable. Displaying cached/mock preview. Run frontend on
            port 3000 to enable live synchronization.
          </span>
        </div>
      )}

      {/* Preview Frame Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: viewport === "desktop" ? "0" : "24px",
          backgroundColor: "#121215",
          overflow: "auto",
        }}
      >
        <div
          style={{
            ...viewportStyles[viewport],
            maxWidth: viewport === "desktop" ? "100%" : viewportStyles[viewport].width,
            transform: scale !== 100 ? `scale(${scale / 100})` : undefined,
            transformOrigin: "top center",
            transition: "all 0.25s ease",
            borderRadius: viewport === "desktop" ? "0" : "16px",
            overflow: "hidden",
            boxShadow:
              viewport === "desktop"
                ? "none"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px #27272a",
            backgroundColor: "#ffffff",
          }}
        >
          <iframe
            ref={iframeRef}
            src={fullPreviewUrl}
            title="Live Content Preview"
            style={{
              width: "100%",
              height: "100%",
              minHeight: viewport === "desktop" ? "580px" : viewportStyles[viewport].height,
              border: "none",
              backgroundColor: "#ffffff",
            }}
            onError={() => setIsOffline(true)}
            onLoad={() => setIsOffline(false)}
          />
        </div>
      </div>
    </div>
  );
}
