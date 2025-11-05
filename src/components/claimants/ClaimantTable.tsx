// [AUTO-GEN-START] ClaimantTable component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, data table with sorting/filtering

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Claimant {
  id: string;
  full_name: string;
  state: string;
  amount: number;
  status?: string;
  created_at: string;
}

interface ClaimantTableProps {
  claimants: Claimant[];
  onSelect?: (claimant: Claimant) => void;
}

export function ClaimantTable({ claimants, onSelect }: ClaimantTableProps) {
  const [sortField, setSortField] = useState<keyof Claimant>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof Claimant) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClaimants = [...claimants].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * modifier;
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * modifier;
    }
    return 0;
  });

  const SortIcon = ({ field }: { field: keyof Claimant }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => handleSort("full_name")}
                className="font-semibold hover:underline"
              >
                Name <SortIcon field="full_name" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("state")}
                className="font-semibold hover:underline"
              >
                State <SortIcon field="state" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("amount")}
                className="font-semibold hover:underline"
              >
                Amount <SortIcon field="amount" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("created_at")}
                className="font-semibold hover:underline"
              >
                Date <SortIcon field="created_at" />
              </button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClaimants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No claimants found
              </TableCell>
            </TableRow>
          ) : (
            sortedClaimants.map((claimant) => (
              <TableRow key={claimant.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/system-administrator/admin/main/claimants/${claimant.id}`}
                    className="hover:underline"
                  >
                    {claimant.full_name}
                  </Link>
                </TableCell>
                <TableCell>{claimant.state}</TableCell>
                <TableCell>${claimant.amount.toLocaleString()}</TableCell>
                <TableCell>
                  {new Date(claimant.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect?.(claimant)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default ClaimantTable;
// [AUTO-GEN-END]
