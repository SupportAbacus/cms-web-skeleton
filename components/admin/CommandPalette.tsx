"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  FileText,
  Package,
  Layers,
  Settings,
  PlusCircle,
  ExternalLink,
  Shield,
  Trash2,
  RefreshCw,
  Folder,
  ArrowRight,
  Command,
} from "lucide-react";

export interface PaletteItem {
  id: string;
  title: string;
  category: "Sites" | "Collections" | "Actions" | "Settings" | "Recent";
  shortcut?: string;
  icon: React.ReactNode;
  href?: string;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (href: string) => void;
  customItems?: PaletteItem[];
}

export function getDefaultItems(): PaletteItem[] {
  return [
    // Sites
    {
      id: "site-brand-a",
      title: "Brand A Storefront",
      category: "Sites",
      icon: <Layers style={{ width: "14px", height: "14px", color: "#3b82f6" }} />,
      href: "/admin/sites/1",
    },
    {
      id: "site-brand-b",
      title: "Brand B Portal",
      category: "Sites",
      icon: <Layers style={{ width: "14px", height: "14px", color: "#8b5cf6" }} />,
      href: "/admin/sites/2",
    },

    // Collections
    {
      id: "col-blogs",
      title: "Blog Articles",
      category: "Collections",
      shortcut: "B",
      icon: <FileText style={{ width: "14px", height: "14px", color: "#10b981" }} />,
      href: "/admin/collections/content-items?where[contentType][equals]=blog",
    },
    {
      id: "col-products",
      title: "Products Catalog",
      category: "Collections",
      shortcut: "P",
      icon: <Package style={{ width: "14px", height: "14px", color: "#f59e0b" }} />,
      href: "/admin/collections/products",
    },
    {
      id: "col-forms",
      title: "Inbound Forms & Submissions",
      category: "Collections",
      icon: <Folder style={{ width: "14px", height: "14px", color: "#06b6d4" }} />,
      href: "/admin/collections/forms",
    },
    {
      id: "col-redirects",
      title: "301 / 302 URL Redirects",
      category: "Collections",
      icon: <ArrowRight style={{ width: "14px", height: "14px", color: "#ec4899" }} />,
      href: "/admin/collections/redirects",
    },

    // Quick Actions
    {
      id: "act-new-blog",
      title: "Create New Blog Post",
      category: "Actions",
      shortcut: "N",
      icon: <PlusCircle style={{ width: "14px", height: "14px", color: "#10b981" }} />,
      href: "/admin/collections/content-items/create?contentType=blog",
    },
    {
      id: "act-new-product",
      title: "Create New Product",
      category: "Actions",
      icon: <PlusCircle style={{ width: "14px", height: "14px", color: "#f59e0b" }} />,
      href: "/admin/collections/products/create",
    },
    {
      id: "act-purge-cache",
      title: "Purge Edge ISR Cache (/api/revalidate)",
      category: "Actions",
      icon: <RefreshCw style={{ width: "14px", height: "14px", color: "#3b82f6" }} />,
      onSelect: () => {
        alert("Triggering global edge cache revalidation webhook...");
      },
    },

    // Settings
    {
      id: "set-smtp",
      title: "Tenant SMTP Settings",
      category: "Settings",
      icon: <Settings style={{ width: "14px", height: "14px", color: "#a1a1aa" }} />,
      href: "/admin/globals/smtp-settings",
    },
    {
      id: "set-ephemeral",
      title: "Ephemeral Developer Access Grants",
      category: "Settings",
      icon: <Shield style={{ width: "14px", height: "14px", color: "#ef4444" }} />,
      href: "/admin/collections/ephemeral-access-grants",
    },
  ];
}

export function CommandPalette({
  isOpen: controlledOpen,
  onClose: controlledClose,
  onNavigate,
  customItems,
}: CommandPaletteProps) {
  const items = useMemo(() => customItems || getDefaultItems(), [customItems]);
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isModalOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleClose = () => {
    if (controlledClose) controlledClose();
    else setInternalOpen(false);
    setQuery("");
    setSelectedIndex(0);
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (controlledOpen === undefined) {
          setInternalOpen((prev) => !prev);
        }
      } else if (e.key === "Escape" && isModalOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [controlledOpen, isModalOpen]);

  // Focus input on open
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isModalOpen]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.shortcut?.toLowerCase() === q
    );
  }, [query, items]);

  // Arrow key navigation
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        if (selected.onSelect) {
          selected.onSelect();
        } else if (selected.href) {
          if (onNavigate) onNavigate(selected.href);
          else window.location.href = selected.href;
        }
        handleClose();
      }
    }
  };

  if (!isModalOpen) return null;

  // Group by category
  const categories = Array.from(new Set(filteredItems.map((i) => i.category)));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#18181b",
          border: "1px solid #3f3f46",
          borderRadius: "14px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          overflow: "hidden",
          color: "#f4f4f5",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            borderBottom: "1px solid #27272a",
          }}
        >
          <Search style={{ width: "18px", height: "18px", color: "#a1a1aa", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or jump to site / collection... (Cmd + K)"
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#ffffff",
              fontSize: "15px",
            }}
          />
          <span
            style={{
              backgroundColor: "#27272a",
              color: "#a1a1aa",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "11px",
              fontFamily: "monospace",
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: "380px",
            overflowY: "auto",
            padding: "10px",
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "#71717a", fontSize: "14px" }}>
              No matching sites, collections, or actions found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              return (
                <div key={cat} style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#71717a",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "6px 10px 4px 10px",
                    }}
                  >
                    {cat}
                  </div>
                  {catItems.map((item) => {
                    const itemIndex = filteredItems.indexOf(item);
                    const isSelected = itemIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.onSelect) item.onSelect();
                          else if (item.href) {
                            if (onNavigate) onNavigate(item.href);
                            else window.location.href = item.href;
                          }
                          handleClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#27272a" : "transparent",
                          color: isSelected ? "#ffffff" : "#d4d4d8",
                          transition: "background-color 0.1s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {item.icon}
                          <span style={{ fontSize: "14px", fontWeight: isSelected ? 500 : 400 }}>
                            {item.title}
                          </span>
                        </div>
                        {item.shortcut && (
                          <span
                            style={{
                              backgroundColor: isSelected ? "#3f3f46" : "#27272a",
                              color: "#a1a1aa",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontFamily: "monospace",
                            }}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            backgroundColor: "#121215",
            borderTop: "1px solid #27272a",
            fontSize: "11px",
            color: "#71717a",
          }}
        >
          <span>Use ↑ ↓ to navigate, Enter to select</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Command style={{ width: "11px", height: "11px" }} />
            <span>Cmd + K</span>
          </span>
        </div>
      </div>
    </div>
  );
}
