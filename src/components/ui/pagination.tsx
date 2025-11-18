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
  // Always show first and last. Show up to 3 pages centered on current.
  // Result array contains numbers or '...'
  const pages: (number | string)[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("...");

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < total - 1) pages.push("...");

  pages.push(total);

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
