"use client";

import React, { useState, useRef, useCallback } from "react";
import { Crosshair, RotateCcw, Image as ImageIcon, Sparkles } from "lucide-react";

export interface FocalPoint {
  x: number; // 0 to 100
  y: number; // 0 to 100
}

export interface FocalPointSelectorProps {
  imageSrc?: string;
  altText?: string;
  initialFocalPoint?: FocalPoint;
  onChange?: (focalPoint: FocalPoint) => void;
  className?: string;
}

export function FocalPointSelector({
  imageSrc = "",
  altText = "Media Asset",
  initialFocalPoint = { x: 50, y: 50 },
  onChange,
  className = "",
}: FocalPointSelectorProps) {
  const [focal, setFocal] = useState<FocalPoint>(initialFocalPoint);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.round(Math.max(0, Math.min(100, rawX)));
      const clampedY = Math.round(Math.max(0, Math.min(100, rawY)));

      const nextFocal = { x: clampedX, y: clampedY };
      setFocal(nextFocal);
      onChange?.(nextFocal);
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateCoordinates(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateCoordinates(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    const center = { x: 50, y: 50 };
    setFocal(center);
    onChange?.(center);
  };

  const setPreset = (x: number, y: number) => {
    const point = { x, y };
    setFocal(point);
    onChange?.(point);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "#18181b",
        border: "1px solid #27272a",
        borderRadius: "12px",
        padding: "20px",
        color: "#f4f4f5",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className={className}
    >
      {/* Header with Title & Coordinates */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #27272a",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Crosshair style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
              Image Focal Point Selector
            </h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#a1a1aa" }}>
              Click or drag on the image to set the crop focus center for responsive screens.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              backgroundColor: "#09090b",
              border: "1px solid #27272a",
              padding: "4px 10px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#38bdf8",
            }}
          >
            X: {focal.x}% | Y: {focal.y}%
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "#27272a",
              color: "#e4e4e7",
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              cursor: "pointer",
            }}
            title="Reset to 50% Center"
          >
            <RotateCcw style={{ width: "12px", height: "12px" }} />
            <span>Center</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: "relative",
          width: "100%",
          maxHeight: "360px",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "crosshair",
          userSelect: "none",
          backgroundColor: "#09090b",
          border: "1px solid #3f3f46",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={altText}
            style={{
              width: "100%",
              maxHeight: "360px",
              objectFit: "contain",
              display: "block",
              pointerEvents: "none",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "#71717a",
            }}
          >
            <ImageIcon style={{ width: "32px", height: "32px", opacity: 0.5 }} />
            <span style={{ fontSize: "13px" }}>No media asset selected</span>
          </div>
        )}

        {/* Reticle Pin */}
        <div
          style={{
            position: "absolute",
            left: `${focal.x}%`,
            top: `${focal.y}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "2px solid #ffffff",
              backgroundColor: "rgba(59, 130, 246, 0.6)",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(59, 130, 246, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", color: "#a1a1aa", marginRight: "4px" }}>
          Quick Positions:
        </span>
        {[
          { label: "Top-Left", x: 15, y: 15 },
          { label: "Top-Center", x: 50, y: 15 },
          { label: "Top-Right", x: 85, y: 15 },
          { label: "Center", x: 50, y: 50 },
          { label: "Bottom-Center", x: 50, y: 85 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPreset(p.x, p.y)}
            style={{
              backgroundColor: focal.x === p.x && focal.y === p.y ? "#3b82f6" : "#27272a",
              color: focal.x === p.x && focal.y === p.y ? "#ffffff" : "#d4d4d8",
              border: "none",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Real-time Crop Previews */}
      <div style={{ borderTop: "1px solid #27272a", paddingTop: "14px" }}>
        <h5 style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 600, color: "#d4d4d8" }}>
          Responsive Aspect Ratio Simulation:
        </h5>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
          {/* 1:1 Square */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: "#a1a1aa" }}>1:1 Square</span>
            <div
              style={{
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid #3f3f46",
                backgroundColor: "#000",
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="1:1 crop"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${focal.x}% ${focal.y}%`,
                  }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#52525b", fontSize: "11px" }}>
                  No preview
                </div>
              )}
            </div>
          </div>

          {/* 16:9 Landscape */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: "#a1a1aa" }}>16:9 Banner</span>
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid #3f3f46",
                backgroundColor: "#000",
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="16:9 crop"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${focal.x}% ${focal.y}%`,
                  }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#52525b", fontSize: "11px" }}>
                  No preview
                </div>
              )}
            </div>
          </div>

          {/* 4:5 Portrait Mobile */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: "#a1a1aa" }}>4:5 Mobile Feed</span>
            <div
              style={{
                width: "100%",
                aspectRatio: "4/5",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid #3f3f46",
                backgroundColor: "#000",
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="4:5 crop"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${focal.x}% ${focal.y}%`,
                  }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#52525b", fontSize: "11px" }}>
                  No preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
