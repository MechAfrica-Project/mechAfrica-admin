"use client";

import { useState } from "react";
import Pagination from "@/components/ui/pagination";
import ListCard from "@/components/lists/ListCard";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set(["1", "2", "6"]));
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(farmerData.length / pageSize));
  const visibleFarmers = farmerData.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === farmerData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(farmerData.map((f) => f.id)));
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
    <ListCard title="Farmers" subtitle={`Total: ${farmerData.length}`} className="overflow-hidden" footer={<Pagination current={page} total={totalPages} onChange={(p) => setPage(p)} />}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedRows.size === farmerData.length}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Phone number
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Date of Registration
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleFarmers.map((farmer) => (
              <tr
                key={farmer.id}
                className="border-b hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedRows.has(farmer.id)}
                    onChange={() => toggleRow(farmer.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-sm text-foreground">
                    <span className="w-2 h-2 rounded-full bg-green-600" />
                    {farmer.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {farmer.phone}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {farmer.date}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 hover:bg-muted rounded transition-colors">
                    <InfoIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListCard>
  );
}
