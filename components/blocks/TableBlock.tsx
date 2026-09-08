import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

export interface TableBlockData {
  title?: string;
  caption?: string;
  headers?: string[];
  rows?: (string[] | { label: string; value: string })[];
}

export function TableBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as TableBlockData;
  const rows = d.rows ?? [];
  const headers = d.headers;
  const caption = d.caption ?? d.title;

  if (rows.length === 0) return null;

  const isKeyValue = typeof rows[0] === "object" && !Array.isArray(rows[0]) && "label" in rows[0];

  return (
    <div className="my-8 space-y-2">
      <Table>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        {headers && headers.length > 0 ? (
          <TableHeader>
            <TableRow>
              {headers.map((h, i) => (
                <TableHead key={i}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
        ) : null}
        <TableBody>
          {isKeyValue
            ? (rows as { label: string; value: string }[]).map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-foreground/90 w-1/3">
                    {r.label}
                  </TableCell>
                  <TableCell>{r.value}</TableCell>
                </TableRow>
              ))
            : (rows as string[][]).map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
