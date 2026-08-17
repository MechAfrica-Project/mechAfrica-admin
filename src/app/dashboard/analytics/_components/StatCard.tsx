"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, suffix = "", icon }: StatCardProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <div className="rounded-xl border bg-white shadow-sm p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1 text-3xl font-bold tracking-tight text-gray-900">
        <motion.span>{display}</motion.span>
        {suffix && <span className="text-xl text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
