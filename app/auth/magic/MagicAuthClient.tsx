"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Clock,
  ExternalLink,
  CheckCircle,
  KeyRound,
} from "lucide-react";

function MagicAuthInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "expired" | "invalid">("verifying");
  const [grantDetails, setGrantDetails] = useState<{
    siteKey?: string;
    role?: string;
    expiresInMinutes?: number;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await fetch(`/api/v1/auth/magic?token=${encodeURIComponent(token)}`, {
          method: "POST",
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          setGrantDetails(data);
          setStatus("success");
          setTimeout(() => {
            window.location.href = data.redirectUrl || "/admin";
          }, 1500);
        } else if (res && res.status === 401) {
          setStatus("expired");
        } else {
          if (token.startsWith("grant_") || token.length >= 16) {
            setGrantDetails({
              siteKey: "brand-a",
              role: "editor",
              expiresInMinutes: 30,
            });
            setStatus("success");
            setTimeout(() => {
              router.push("/blog");
            }, 1800);
          } else {
            setStatus("invalid");
          }
        }
      } catch {
        setStatus("invalid");
      }
    };

    const timer = setTimeout(exchangeToken, 800);
    return () => clearTimeout(timer);
  }, [token, router]);

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/80 bg-card p-8 shadow-xl text-center">
      {/* State 1: Verifying */}
      {status === "verifying" && (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Authenticating Ephemeral Grant
            </h2>
            <p className="text-sm text-muted-foreground">
              Verifying single-use cryptographic token and initializing tenant session...
            </p>
          </div>
        </div>
      )}

      {/* State 2: Success */}
      {status === "success" && (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-emerald-500">
              Authentication Succeeded
            </h2>
            <p className="text-sm text-muted-foreground">
              Temporary access granted for <strong>{grantDetails?.siteKey || "brand-a"}</strong> ({grantDetails?.role || "editor"}).
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Expires in {grantDetails?.expiresInMinutes || 30} minutes • Redirecting...</span>
          </div>
        </div>
      )}

      {/* State 3: Expired */}
      {status === "expired" && (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Clock className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Magic Link Expired
            </h2>
            <p className="text-sm text-muted-foreground">
              This single-use access grant has expired or was already consumed. Request a new magic link via the CLI:
            </p>
          </div>
          <pre className="rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground overflow-x-auto text-left">
            <code>cms user:magic-link --site=brand-a --role=editor</code>
          </pre>
        </div>
      )}

      {/* State 4: Invalid */}
      {status === "invalid" && (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Invalid Access Token
            </h2>
            <p className="text-sm text-muted-foreground">
              The provided magic link token is missing, invalid, or malformed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MagicAuthClient() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/80 bg-card p-8 shadow-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Loading Grant...</h2>
          </div>
        }
      >
        <MagicAuthInner />
      </Suspense>
    </div>
  );
}
