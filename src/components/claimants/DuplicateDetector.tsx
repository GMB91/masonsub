// [AUTO-GEN-START] DuplicateDetector component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, duplicate detection UI

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Claimant {
  id: string;
  full_name: string;
  state: string;
  amount: number;
  address?: string;
  similarity?: number;
}

interface DuplicateMatch {
  candidate: Claimant;
  matches: Claimant[];
  confidence: number;
}

interface DuplicateDetectorProps {
  duplicates: DuplicateMatch[];
  onMerge?: (candidateId: string, matchId: string) => void;
  onIgnore?: (candidateId: string, matchId: string) => void;
}

export function DuplicateDetector({
  duplicates,
  onMerge,
  onIgnore,
}: DuplicateDetectorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-red-600 bg-red-50";
    if (confidence >= 0.7) return "text-orange-600 bg-orange-50";
    return "text-yellow-600 bg-yellow-50";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potential Duplicates ({duplicates.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {duplicates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No duplicate claimants detected
          </p>
        ) : (
          <div className="space-y-4">
            {duplicates.map((dup) => (
              <div key={dup.candidate.id} className="border rounded-lg p-4">
                {/* Candidate Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{dup.candidate.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {dup.candidate.state} • ${dup.candidate.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceColor(
                        dup.confidence
                      )}`}
                    >
                      {(dup.confidence * 100).toFixed(0)}% match
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(dup.candidate.id)}
                    >
                      {expanded.has(dup.candidate.id) ? "▼" : "▶"}
                    </Button>
                  </div>
                </div>

                {/* Matches (Expandable) */}
                {expanded.has(dup.candidate.id) && (
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    {dup.matches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-gray-50 rounded p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{match.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {match.state} • ${match.amount.toLocaleString()}
                            {match.address && ` • ${match.address}`}
                          </div>
                          {match.similarity && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Similarity: {(match.similarity * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMerge?.(dup.candidate.id, match.id)}
                          >
                            Merge
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onIgnore?.(dup.candidate.id, match.id)}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DuplicateDetector;
// [AUTO-GEN-END]
