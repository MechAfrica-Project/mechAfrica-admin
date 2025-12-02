"use client";

import { useEffect, useState } from "react";

type Summary = {
  revenue: { value: string; delta: string };
  withdrawals: { value: string; delta: string };
  payments: { value: string; delta: string };
  commission: { value: string; delta: string };
};

export type ChartPoint = { month: string; thisYear: number; lastYear: number; overTime: number };

export function useFinancesData() {
  const [data, setData] = useState<{ summary?: Summary; chart?: ChartPoint[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch("/api/finances/data")
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .catch(() => {
        // ignore and keep defaults
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}
