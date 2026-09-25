"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Copy,
  Check,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";

export interface MagicGrant {
  id: string;
  email: string;
  role: "viewer" | "editor" | "admin" | "ai-auditor";
  siteKey: string;
  token: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "consumed" | "revoked" | "expired";
}

const INITIAL_GRANTS: MagicGrant[] = [
  {
    id: "grant-7821",
    email: "sarah.lead@agency.com",
    role: "editor",
    siteKey: "brand-a",
    token: "tok_sec6_8f91a2bc4d",
    url: "http://localhost:3000/auth/magic?token=tok_sec6_8f91a2bc4d",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    status: "active",
  },
  {
    id: "grant-4190",
    email: "ai-audit-bot@internal.corp",
    role: "ai-auditor",
    siteKey: "all",
    token: "tok_sec6_e23c881fa0",
    url: "http://localhost:3000/auth/magic?token=tok_sec6_e23c881fa0",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "expired",
  },
];

export function MagicLinkGeneratorPanel() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "admin" | "ai-auditor">("editor");
  const [siteKey, setSiteKey] = useState("brand-a");
  const [ttlMinutes, setTtlMinutes] = useState(60);
  const [generatedGrant, setGeneratedGrant] = useState<MagicGrant | null>(null);
  const [copied, setCopied] = useState(false);
  const [smtpSent, setSmtpSent] = useState(false);
  const [grants, setGrants] = useState<MagicGrant[]>(INITIAL_GRANTS);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const randomHex = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 8);
    const token = `tok_sec6_${randomHex}`;
    const url = `http://localhost:3000/auth/magic?token=${token}`;

    const newGrant: MagicGrant = {
      id: `grant-${Math.floor(Math.random() * 9000 + 1000)}`,
      email,
      role,
      siteKey,
      token,
      url,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
      status: "active",
    };

    setGeneratedGrant(newGrant);
    setGrants([newGrant, ...grants]);
    setCopied(false);
    setSmtpSent(false);
  };

  const copyToClipboard = () => {
    if (!generatedGrant) return;
    navigator.clipboard.writeText(generatedGrant.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerSmtpSend = () => {
    setSmtpSent(true);
    setTimeout(() => setSmtpSent(false), 3000);
  };

  const revokeGrant = (id: string) => {
    setGrants(
      grants.map((g) => (g.id === id ? { ...g, status: "revoked" as const } : g))
    );
    if (generatedGrant && generatedGrant.id === id) {
      setGeneratedGrant({ ...generatedGrant, status: "revoked" });
    }
  };

  return (
    <div style={{ fontFamily: "inherit", color: "#0f172a", maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: "#e0e7ff",
            color: "#4338ca",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KeyRound style={{ width: "22px", height: "22px" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Ephemeral Magic Link Self-Service Generator
          </h2>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
            PRD §7.1 Cryptographically Signed Single-Use Access Grants & Developer Tokens
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Generator Form Card */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 1.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles style={{ width: "18px", height: "18px", color: "#4f46e5" }} />
            Generate Access Grant
          </h3>

          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Target Recipient Email
              </label>
              <input
                type="email"
                required
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Role Permission
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="viewer">Viewer (Read Only)</option>
                  <option value="editor">Editor (Draft & Publish)</option>
                  <option value="admin">Site Admin</option>
                  <option value="ai-auditor">AI Auditing Agent (Draft Guardrail)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Tenant Scope
                </label>
                <select
                  value={siteKey}
                  onChange={(e) => setSiteKey(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="brand-a">Site: brand-a</option>
                  <option value="brand-b">Site: brand-b</option>
                  <option value="all">Global / Superadmin</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Expiration Lifetime (TTL)
              </label>
              <select
                value={ttlMinutes}
                onChange={(e) => setTtlMinutes(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value={15}>15 Minutes (High Security)</option>
                <option value={60}>1 Hour (Standard)</option>
                <option value={1440}>24 Hours (Developer Session)</option>
                <option value={10080}>7 Days (Extended)</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                marginTop: "0.5rem",
                padding: "0.625rem 1rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <KeyRound style={{ width: "16px", height: "16px" }} />
              Issue Signed Magic Link
            </button>
          </form>
        </div>

        {/* Generated Token Display Card */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 1.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield style={{ width: "18px", height: "18px", color: "#10b981" }} />
            Active Grant Payload
          </h3>

          {generatedGrant ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>
                  Signed Magic Link URL
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.8125rem",
                    wordBreak: "break-all",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  {generatedGrant.url}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8125rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Role: </span>
                  <strong style={{ color: "#0f172a" }}>{generatedGrant.role}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Scope: </span>
                  <strong style={{ color: "#0f172a" }}>{generatedGrant.siteKey}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Expires: </span>
                  <strong style={{ color: "#0f172a" }}>{new Date(generatedGrant.expiresAt).toLocaleTimeString()}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Status: </span>
                  <strong style={{ color: "#10b981" }}>{generatedGrant.status}</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: copied ? "#dcfce7" : "#ffffff",
                    color: copied ? "#166534" : "#0f172a",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                  }}
                >
                  {copied ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>

                <button
                  onClick={triggerSmtpSend}
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: smtpSent ? "#16a34a" : "#0f172a",
                    color: "#ffffff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                  }}
                >
                  {smtpSent ? <Check style={{ width: "14px", height: "14px" }} /> : <Send style={{ width: "14px", height: "14px" }} />}
                  {smtpSent ? "Dispatched!" : "Dispatch SMTP"}
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2.5rem 1rem",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              <KeyRound style={{ width: "32px", height: "32px", strokeWidth: 1.5, marginBottom: "0.5rem" }} />
              <p style={{ margin: 0, fontSize: "0.875rem" }}>
                Fill out the generator form to issue a cryptographically signed magic login URL.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Grants List */}
      <div style={{ borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ margin: 0, fontWeight: 600, fontSize: "0.9375rem" }}>Active & Historical Magic Link Grants</h4>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Single-use token lifecycle</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Grant ID</th>
                <th style={{ padding: "0.75rem 1rem" }}>Recipient</th>
                <th style={{ padding: "0.75rem 1rem" }}>Role</th>
                <th style={{ padding: "0.75rem 1rem" }}>Scope</th>
                <th style={{ padding: "0.75rem 1rem" }}>Expires</th>
                <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((g) => (
                <tr key={g.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 600 }}>{g.id}</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{g.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: g.role === "ai-auditor" ? "#fef3c7" : "#e0e7ff",
                        color: g.role === "ai-auditor" ? "#92400e" : "#3730a3",
                      }}
                    >
                      {g.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{g.siteKey}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.8125rem" }}>
                    {new Date(g.expiresAt).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor:
                          g.status === "active" ? "#dcfce7" : g.status === "revoked" ? "#fee2e2" : "#f1f5f9",
                        color:
                          g.status === "active" ? "#166534" : g.status === "revoked" ? "#991b1b" : "#64748b",
                      }}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    {g.status === "active" ? (
                      <button
                        onClick={() => revokeGrant(g.id)}
                        title="Revoke Token"
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #fca5a5",
                          backgroundColor: "#fef2f2",
                          color: "#b91c1c",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Revoke
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MagicLinkGeneratorPanel;
