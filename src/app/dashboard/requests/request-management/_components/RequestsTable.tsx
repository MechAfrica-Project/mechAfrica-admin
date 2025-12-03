"use client";

import React from 'react';
import { mockRequests, RequestItem } from './mockRequests';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
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
    if (value) setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleRows.map((r) => r.id)])));
    else setSelectedIds((prev) => prev.filter((id) => !visibleRows.some((r) => r.id === id)));
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
    <ListCard footer={<Pagination current={page} total={totalPages} onChange={(p) => setPage(p)} />} className="mt-6">
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white">
          <tr>
            <th className="px-4 py-3">
              <Checkbox
                checked={selectedIds.length === rows.length && rows.length > 0}
                onCheckedChange={(v) => toggleSelectAll(!!v)}
                aria-label="Select all"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {visibleRows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <Checkbox
                  checked={selectedIds.includes(row.id)}
                  onCheckedChange={(v) => toggleRow(row.id, !!v)}
                  aria-label={`Select ${row.name}`}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-teal-600 text-white font-semibold text-xs">
                      {row.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{row.name}</div>
                    <div className="text-xs text-muted-foreground">{row.handle}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={row.status} /></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => handleInfo(row)} className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
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
