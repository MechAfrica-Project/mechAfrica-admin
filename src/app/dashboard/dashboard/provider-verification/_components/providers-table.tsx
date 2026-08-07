"use client";

import React from "react";
import { useTableStore } from "@/stores/useTableStore";
import { Badge } from "@/components/ui/badge";
import type { ProviderListItem } from "../types";
import ListCard from '@/components/lists/ListCard';
import Pagination from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  isLoading?: boolean;
  providers: ProviderListItem[];
  onProviderClick: (p: ProviderListItem) => void;
}

export function ProvidersTable({ isLoading, providers, onProviderClick }: Props) {
  const page = useTableStore((s) => s.pages["providers"] || 1);
  const setPage = useTableStore((s) => s.setPage);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(providers.length / pageSize));
  const visibleProviders = providers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <ListCard className="overflow-hidden" footer={<Pagination current={page} total={totalPages} onChange={(p) => setPage("providers", p)} />}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-left text-sm text-muted-foreground border-t border-b">
              <TableHead className="px-6 py-3">Name</TableHead>
              <TableHead className="px-6 py-3">Type</TableHead>
              <TableHead className="px-6 py-3">Phone number</TableHead>
              <TableHead className="px-6 py-3">Date of Registration</TableHead>
              <TableHead className="px-6 py-3 w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && providers.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-4 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No providers found.
                </TableCell>
              </TableRow>
            ) : (
              visibleProviders.map((p) => (
              <TableRow
                key={p.id}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onProviderClick(p)}
              >
                <TableCell className="px-6 py-4 align-top">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 ${p.color} rounded-full flex items-center justify-center text-white font-semibold`}
                    >
                      {p.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.handle}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 align-top">
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 align-middle" />
                    {p.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 align-top text-sm text-foreground">
                  {p.phone}
                </TableCell>
                <TableCell className="px-6 py-4 align-top text-sm text-foreground">
                  {p.registrationDate}
                </TableCell>
                <TableCell className="px-6 py-4 align-top text-right" />
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>
      {isLoading && providers.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-10 rounded-t-xl">
          <div className="h-full bg-primary animate-[progress_1s_ease-in-out_infinite]" style={{ width: "50%", transformOrigin: "0% 50%" }} />
        </div>
      )}
    </ListCard>
  );
}
