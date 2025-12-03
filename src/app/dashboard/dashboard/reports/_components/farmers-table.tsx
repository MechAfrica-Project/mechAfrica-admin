"use client";

import { useTableStore } from "@/stores/useTableStore";
import Pagination from "@/components/ui/pagination";
import ListCard from "@/components/lists/ListCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoIcon } from "lucide-react";

interface Farmer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  initials: string;
  type: string;
  phone: string;
  date: string;
}

const farmerData: Farmer[] = [
  {
    id: "1",
    name: "Jane Cooper",
    handle: "@Ad324h463",
    avatar: "JC",
    initials: "JC",
    type: "Farmer",
    phone: "05552731324",
    date: "5/27/15",
  },
  {
    id: "2",
    name: "Wade Warren",
    handle: "@Ad324h463",
    avatar: "WW",
    initials: "WW",
    type: "Farmer",
    phone: "05552731324",
    date: "5/19/12",
  },
  {
    id: "3",
    name: "Esther Howard",
    handle: "@Ad324h463",
    avatar: "EH",
    initials: "EH",
    type: "Farmer",
    phone: "05552731324",
    date: "3/4/16",
  },
  {
    id: "4",
    name: "Jenny Wilson",
    handle: "@Ad324h463",
    avatar: "JW",
    initials: "JW",
    type: "Farmer",
    phone: "05552731324",
    date: "3/4/16",
  },
  {
    id: "5",
    name: "Guy Hawkins",
    handle: "@Ad324h463",
    avatar: "GH",
    initials: "GH",
    type: "Farmer",
    phone: "05552731324",
    date: "7/27/13",
  },
  {
    id: "6",
    name: "Jacob Jones",
    handle: "@Ad324h463",
    avatar: "JJ",
    initials: "JJ",
    type: "Farmer",
    phone: "05552731324",
    date: "5/27/15",
  },
];

type Metric = "farmer" | "provider" | "solved" | "escalated";

interface FarmersTableProps {
  metric: Metric;
}

export function FarmersTable({ metric: _metric }: FarmersTableProps) {
  void _metric;
  const selectedRows = useTableStore((s) => s.selections["farmers"] || []);
  const toggleSelect = useTableStore((s) => s.toggleSelect);
  const selectMany = useTableStore((s) => s.selectMany);
  const deselectMany = useTableStore((s) => s.deselectMany);
  // Pagination
  const page = useTableStore((s) => s.pages["farmers"] || 1);
  const setPage = useTableStore((s) => s.setPage);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(farmerData.length / pageSize));
  const visibleFarmers = farmerData.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: string, value?: boolean) => {
    if (typeof value === 'boolean') {
      if (value) selectMany('farmers', [id]);
      else deselectMany('farmers', [id]);
    } else {
      toggleSelect('farmers', id);
    }
  };

  const toggleAll = (value?: boolean) => {
    const shouldSelect = Boolean(value);
    if (shouldSelect) {
      selectMany('farmers', visibleFarmers.map((f) => f.id));
    } else {
      deselectMany('farmers', visibleFarmers.map((f) => f.id));
    }
  };

  const getAvatarColor = (initials: string) => {
    const colors = [
      "bg-green-700",
      "bg-blue-700",
      "bg-purple-700",
      "bg-red-700",
      "bg-yellow-700",
      "bg-indigo-700",
    ];
    const charCode = initials.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <ListCard className="overflow-hidden" footer={<Pagination current={page} total={totalPages} onChange={(p) => setPage("farmers", p)} />}>
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={visibleFarmers.length > 0 && visibleFarmers.every((f) => selectedRows.includes(f.id))}
                onCheckedChange={(v) => toggleAll(!!v)}
                data-indeterminate={visibleFarmers.some((f) => selectedRows.includes(f.id)) && !visibleFarmers.every((f) => selectedRows.includes(f.id)) || undefined}
                className="rounded"
              />
            </TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">Name</TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">Type</TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">Phone number</TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">Date of Registration</TableHead>
            <TableHead className="text-right text-sm font-medium text-muted-foreground">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleFarmers.map((farmer) => (
            <TableRow key={farmer.id} className="border-b hover:bg-muted/30 transition-colors">
              <TableCell className="py-3 px-4">
                <Checkbox
                  checked={selectedRows.includes(farmer.id)}
                  onCheckedChange={(v) => toggleRow(farmer.id, !!v)}
                  className="rounded"
                />
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${getAvatarColor(
                      farmer.initials
                    )} flex items-center justify-center text-xs font-semibold text-white`}
                  >
                    {farmer.initials}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-foreground">
                      {farmer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {farmer.handle}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <span className="inline-flex items-center gap-1 text-sm text-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-600" />
                  {farmer.type}
                </span>
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-foreground">{farmer.phone}</TableCell>
              <TableCell className="py-3 px-4 text-sm text-foreground">{farmer.date}</TableCell>
              <TableCell className="py-3 px-4 text-right">
                <button className="p-1 hover:bg-muted rounded transition-colors">
                  <InfoIcon className="w-4 h-4 text-muted-foreground" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ListCard>
  );
}
