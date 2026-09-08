"use client";

import React, { useState } from "react";
import { Search, Share2, Globe, ShieldCheck, ExternalLink } from "lucide-react";

export type PreviewTab = "google-desktop" | "google-mobile" | "twitter" | "opengraph";

export interface SerpSocialPreviewProps {
  siteDomain?: string;
  contentType?: string;
  slug?: string;
  title?: string;
  metaDescription?: string;
  socialImage?: string;
  canonical?: string;
  indexing?: "index" | "noindex";
  className?: string;
}

export function SerpSocialPreview({
  siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN || "localhost:3000",
  contentType = "blog",
  slug = "",
  title = "",
  metaDescription = "",
  socialImage = "",
  canonical,
  indexing = "index",
  className = "",
}: SerpSocialPreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("google-desktop");

  const titleLength = (title || "").length;
  const descLength = (metaDescription || "").length;

  const titleStatus =
    titleLength >= 45 && titleLength <= 60
      ? "optimal"
      : titleLength > 60
      ? "warning"
      : "short";

  const descStatus =
    descLength >= 130 && descLength <= 160
      ? "optimal"
      : descLength > 160
      ? "warning"
      : "short";

  const statusColors = {
    optimal: "#10b981",
    warning: "#f59e0b",
    short: "#60a5fa",
  };

  const canonicalUrl = canonical || `https://${siteDomain}/${contentType}/${slug}`;

  return (
    <div
      style={{
        backgroundColor: "#18181b",
        border: "1px solid #27272a",
        borderRadius: "12px",
        padding: "20px",
        color: "#f4f4f5",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className={className}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #27272a",
          paddingBottom: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
            Live Google SERP & Social Card Preview
          </h4>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#a1a1aa" }}>
            Real-time simulation of search engine snippets and social graph shares.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: indexing === "index" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
              color: indexing === "index" ? "#34d399" : "#f87171",
              border: indexing === "index" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
            }}
          >
            <ShieldCheck style={{ width: "12px", height: "12px" }} />
            <span>{indexing === "index" ? "INDEX, FOLLOW" : "NOINDEX"}</span>
          </span>
        </div>
      </div>

      {/* Counters Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "14px",
          fontSize: "12px",
          backgroundColor: "#09090b",
          padding: "8px 14px",
          borderRadius: "8px",
          border: "1px solid #27272a",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#a1a1aa" }}>SEO Title:</span>
          <span style={{ fontWeight: 600, color: statusColors[titleStatus] }}>
            {titleLength} / 60 chars
          </span>
          <span style={{ fontSize: "10px", color: "#71717a" }}>
            ({titleStatus === "optimal" ? "Optimal" : titleStatus === "warning" ? "May truncate" : "Short"})
          </span>
        </div>

        <div style={{ width: "1px", height: "14px", backgroundColor: "#3f3f46" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#a1a1aa" }}>Meta Description:</span>
          <span style={{ fontWeight: 600, color: statusColors[descStatus] }}>
            {descLength} / 160 chars
          </span>
          <span style={{ fontSize: "10px", color: "#71717a" }}>
            ({descStatus === "optimal" ? "Optimal" : descStatus === "warning" ? "May truncate" : "Short"})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "google-desktop", label: "Google Desktop", icon: <Search style={{ width: "13px", height: "13px" }} /> },
          { id: "google-mobile", label: "Google Mobile", icon: <Globe style={{ width: "13px", height: "13px" }} /> },
          {
            id: "twitter",
            label: "X / Twitter Card",
            icon: (
              <svg style={{ width: "13px", height: "13px", fill: "currentColor" }} viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            ),
          },
          { id: "opengraph", label: "OpenGraph / FB", icon: <Share2 style={{ width: "13px", height: "13px" }} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as PreviewTab)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              backgroundColor: activeTab === tab.id ? "#3f3f46" : "#27272a",
              color: activeTab === tab.id ? "#ffffff" : "#a1a1aa",
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Preview Stage */}
      <div
        style={{
          backgroundColor: activeTab === "google-desktop" || activeTab === "google-mobile" ? "#202124" : "#000000",
          borderRadius: "8px",
          padding: "20px",
          border: "1px solid #3f3f46",
          overflow: "hidden",
        }}
      >
        {/* Google Desktop Preview */}
        {activeTab === "google-desktop" && (
          <div style={{ maxWidth: "600px", fontFamily: "arial, sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#303134",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: "#e8eaed",
                }}
              >
                G
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "14px", color: "#dadce0" }}>{siteDomain}</span>
                <span style={{ fontSize: "12px", color: "#bdc1c6" }}>
                  https://{siteDomain} &gt; {contentType} &gt; {slug}
                </span>
              </div>
            </div>
            <h3
              style={{
                margin: "4px 0 6px 0",
                fontSize: "20px",
                fontWeight: 400,
                color: "#99c3ff",
                lineHeight: 1.3,
                cursor: "pointer",
              }}
            >
              {title || "Untitled Document"}
            </h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#bdc1c6", lineHeight: 1.4 }}>
              {metaDescription || "No description provided for search engine result snippets."}
            </p>
          </div>
        )}

        {/* Google Mobile Preview */}
        {activeTab === "google-mobile" && (
          <div
            style={{
              maxWidth: "360px",
              margin: "0 auto",
              fontFamily: "arial, sans-serif",
              backgroundColor: "#303134",
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#5f6368",
                  color: "#fff",
                  fontSize: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                G
              </div>
              <span style={{ fontSize: "12px", color: "#bdc1c6" }}>
                {siteDomain} &gt; {slug}
              </span>
            </div>
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: "16px",
                fontWeight: 400,
                color: "#99c3ff",
                lineHeight: 1.3,
              }}
            >
              {title || "Untitled Document"}
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#bdc1c6", lineHeight: 1.4 }}>
              {metaDescription || "No description snippet."}
            </p>
          </div>
        )}

        {/* Twitter / X Large Summary Card */}
        {activeTab === "twitter" && (
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto",
              borderRadius: "16px",
              border: "1px solid #2f3336",
              backgroundColor: "#000000",
              overflow: "hidden",
            }}
          >
            {socialImage ? (
              <div style={{ width: "100%", aspectRatio: "1.91/1", overflow: "hidden", backgroundColor: "#16181c" }}>
                <img
                  src={socialImage}
                  alt="Social banner"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : null}
            <div style={{ padding: "12px" }}>
              <span style={{ fontSize: "12px", color: "#71767b" }}>{siteDomain}</span>
              <h4 style={{ margin: "2px 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#e7e9ea" }}>
                {title || "Untitled Document"}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#71767b",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {metaDescription}
              </p>
            </div>
          </div>
        )}

        {/* OpenGraph (Facebook / LinkedIn) */}
        {activeTab === "opengraph" && (
          <div
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              border: "1px solid #3a3b3c",
              backgroundColor: "#242526",
              overflow: "hidden",
            }}
          >
            {socialImage ? (
              <div style={{ width: "100%", aspectRatio: "1.91/1", overflow: "hidden", backgroundColor: "#18191a" }}>
                <img
                  src={socialImage}
                  alt="OG banner"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : null}
            <div style={{ padding: "10px 14px", backgroundColor: "#3a3b3c" }}>
              <span style={{ fontSize: "11px", color: "#b0b3b8", textTransform: "uppercase" }}>
                {siteDomain}
              </span>
              <h4 style={{ margin: "2px 0 2px 0", fontSize: "16px", fontWeight: 600, color: "#e4e6eb" }}>
                {title || "Untitled Document"}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#b0b3b8",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {metaDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
