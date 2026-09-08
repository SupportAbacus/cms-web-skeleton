import React from "react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold tracking-tight">404 - Not Found</h2>
      <p className="mt-2 text-muted-foreground">The requested page could not be found.</p>
      <a
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Return Home
      </a>
    </div>
  );
}
