"use client";

import React from 'react';
import { mockRequests, RequestItem } from './mockRequests';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import RequestDetailsDialog from './RequestDetailsDialog';
import { toast } from 'sonner';
import ListCard from '@/components/lists/ListCard';
import Pagination from '@/components/ui/pagination';

function StatusPill({ status }: { status: RequestItem['status'] }) {
  const color =
    status === 'Active'
      ? 'bg-green-100 text-green-700'
      : status === 'Offline'
      ? 'bg-gray-100 text-gray-700'
      : status === 'Wait'
      ? 'bg-yellow-100 text-yellow-700'
      : status === 'Cancelled'
      ? 'bg-red-100 text-red-700'
      : 'bg-indigo-100 text-indigo-700';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function RequestsTable({ filter }: { filter: string }) {
  const filtered = React.useMemo(() => {
    if (!filter) return mockRequests;
    switch (filter) {
      case 'new':
        return mockRequests.slice(0, 3);
      case 'ongoing':
        return mockRequests.filter((r) => r.status === 'Active' || r.status === 'Ongoing');
      case 'completed':
        return mockRequests.filter((r) => r.status === 'Completed');
      case 'cancelled':
        return mockRequests.filter((r) => r.status === 'Cancelled');
      case 'provider':
        return mockRequests.slice(2, 6);
      case 'demand':
        return mockRequests.slice(6);
      default:
        return mockRequests;
    }
  }, [filter]);

  const [rows, setRows] = React.useState<RequestItem[]>(filtered);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  // pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    setRows(filtered);
    setSelectedIds([]);
    setPage(1);
  }, [filter, filtered]);

  const toggleSelectAll = (value?: boolean) => {
    const shouldSelect = Boolean(value);
    if (shouldSelect) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleRows.map((r) => r.id)])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !visibleRows.some((r) => r.id === id)));
    }
  };

  const toggleRow = (id: string, value?: boolean) => {
    setSelectedIds((prev) => {
      if (value) return Array.from(new Set([...prev, id]));
      return prev.filter((p) => p !== id);
    });
  };

  const [infoOpen, setInfoOpen] = React.useState(false);
  const [infoRow, setInfoRow] = React.useState<RequestItem | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDeleteId, setToDeleteId] = React.useState<string | null>(null);

  const handleDelete = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!toDeleteId) return;
    setRows((prev) => prev.filter((r) => r.id !== toDeleteId));
    setSelectedIds((prev) => prev.filter((p) => p !== toDeleteId));
    setToDeleteId(null);
    setConfirmOpen(false);
    toast.success('Request deleted');
  };

  const handleInfo = (row: RequestItem) => {
    setInfoRow(row);
    setInfoOpen(true);
  };

  return (
    <ListCard
      className="mt-6"
      footer={
        totalPages > 1 ? (
          <div className="mt-2">
            <Pagination current={page} total={totalPages} onChange={(p) => setPage(p)} />
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{String(page).padStart(2, "0")}</span> of <span className="font-semibold text-foreground">{String(totalPages).padStart(2, "0")}</span>
            </div>
          </div>
        ) : null
      }
    >
      <div className="overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={visibleRows.length > 0 && visibleRows.every((r) => selectedIds.includes(r.id))}
                  onCheckedChange={(v) => toggleSelectAll(!!v)}
                  data-indeterminate={visibleRows.some((r) => selectedIds.includes(r.id)) && !visibleRows.every((r) => selectedIds.includes(r.id)) || undefined}
                />
              </TableHead>
              <TableHead className="text-sm font-medium text-muted-foreground">Users</TableHead>
              <TableHead className="text-sm font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-sm font-medium text-muted-foreground">E-mail</TableHead>
              <TableHead className="text-sm font-medium text-muted-foreground">Date</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow key={row.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <TableCell className="py-3 px-4">
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onCheckedChange={(v) => toggleRow(row.id, !!v)}
                    aria-label={`Select ${row.name}`}
                  />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-teal-600 text-white font-semibold text-xs">
                        {row.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-foreground">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.handle}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4"><StatusPill status={row.status} /></TableCell>
                <TableCell className="py-3 px-4 text-sm text-foreground">{row.email}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-muted-foreground">{row.date}</TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleInfo(row)} className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <RequestDetailsDialog open={infoOpen} onOpenChange={setInfoOpen} row={infoRow} />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete request"
        description="Are you sure you want to delete this request?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </ListCard>
  );
}
 
