"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ProviderListItem } from "../types";
import ListCard from '@/components/lists/ListCard';
import Pagination from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  providers: ProviderListItem[];
  onProviderClick: (p: ProviderListItem) => void;
}

export function ProvidersTable({ providers, onProviderClick }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(providers.length / pageSize));
  const visibleProviders = providers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <ListCard className="overflow-hidden" footer={<Pagination current={page} total={totalPages} onChange={(p) => setPage(p)} />}>
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
            {visibleProviders.map((p) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </ListCard>
  );
}
