"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface ListCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function ListCard({ title, subtitle, actions, children, footer, className = "" }: ListCardProps) {
  return (
    <Card className={`rounded-lg border border-border ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-b border-border">
          <div>
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="p-0">{children}</div>

      {footer && <div className="p-4 border-t border-border">{footer}</div>}
    </Card>
  );
}
