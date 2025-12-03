"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  current: number; // 1-based
  total: number;
  onChange: (page: number) => void;
}

function getPageList(current: number, total: number) {
  // Show a condensed pagination: at most two page numbers are visible at once
  // (a pair). Example: « ... 02 03 ... » with previous/next arrows.
  // For small totals, show all pages for usability.
  const pages: (number | string)[] = [];

  if (total <= 4) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Determine the start of the two-page window. Show [current-1, current]
  // (previous + current). Clamp to valid page range so window doesn't overflow.
  let start = current - 1;
  if (start < 1) start = 1;
  if (start > total - 1) start = total - 1;

  // Leading ellipsis if there are pages before the window (beyond page 1 and 2)
  if (start > 2) pages.push("...");

  pages.push(start);
  pages.push(start + 1);

  // Trailing ellipsis if there are pages after the window
  if (start + 1 < total - 1) pages.push("...");

  return pages;
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;

  const pages = getPageList(current, total);

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(1, current - 1))}
        className="h-9 w-9"
        disabled={current <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          typeof p === "string" ? (
            <span key={String(p) + idx} className="px-2 text-muted-foreground">
              {p}
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`h-9 min-w-9 rounded-md text-sm font-semibold transition-colors ${
                current === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {String(p).padStart(2, "0")}
            </button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current >= total}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </Button>
    </div>
  );
}
