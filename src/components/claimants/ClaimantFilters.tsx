// [AUTO-GEN-START] ClaimantFilters component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, advanced filtering UI

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface FilterState {
  state?: string;
  status?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

interface ClaimantFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export function ClaimantFilters({
  onFilterChange,
  initialFilters = {},
}: ClaimantFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const states = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "NT", "ACT"];
  const statuses = ["New", "In Progress", "Contacted", "Claimed", "Closed"];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium">Search</label>
            <input
              type="text"
              placeholder="Name, email..."
              className="w-full mt-1 p-2 border rounded"
              value={filters.searchTerm || ""}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-medium">State</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={filters.state || ""}
              onChange={(e) => handleFilterChange("state", e.target.value)}
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-sm font-medium">Amount Range</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                placeholder="Min"
                className="w-full p-2 border rounded"
                value={filters.amountMin || ""}
                onChange={(e) =>
                  handleFilterChange("amountMin", parseFloat(e.target.value))
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full p-2 border rounded"
                value={filters.amountMax || ""}
                onChange={(e) =>
                  handleFilterChange("amountMax", parseFloat(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={() => onFilterChange(filters)}>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClaimantFilters;
// [AUTO-GEN-END]
