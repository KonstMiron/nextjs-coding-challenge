"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PlayerData } from "@/types/game";
import { useRouter, useSearchParams } from "next/navigation";

interface PlayersTableProps {
  players: PlayerData[];
  currentPlayerId?: string;
}

type SortField = "name" | "wpm" | "accuracy" | "progress";
type SortOrder = "asc" | "desc";

export function PlayersTable({ players, currentPlayerId }: PlayersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get("sort") as SortField) || "wpm"
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get("order") as SortOrder) || "desc"
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const updateURL = (field: SortField, order: SortOrder) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", field);
    params.set("order", order);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSort = (field: SortField) => {
    const newOrder = 
      sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);
    updateURL(field, newOrder);
  };

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "wpm":
          aVal = a.wpm;
          bVal = b.wpm;
          break;
        case "accuracy":
          aVal = a.accuracy;
          bVal = b.accuracy;
          break;
        case "progress":
          aVal = a.currentProgress.length;
          bVal = b.currentProgress.length;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [players, sortField, sortOrder]);

  const paginatedPlayers = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return sortedPlayers.slice(start, start + rowsPerPage);
  }, [sortedPlayers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedPlayers.length / rowsPerPage);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="font-semibold hover:text-primary flex items-center gap-1"
    >
      {label}
      {sortField === field && (
        <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">
                  <SortButton field="progress" label="Live Progress" />
                </th>
                <th className="text-left p-2">
                  <SortButton field="name" label="Player Name" />
                </th>
                <th className="text-left p-2">
                  <SortButton field="wpm" label="WPM" />
                </th>
                <th className="text-left p-2">
                  <SortButton field="accuracy" label="Accuracy" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.map((player) => (
                <tr
                  key={player.id}
                  className={`border-b hover:bg-muted/50 ${
                    player.id === currentPlayerId ? "bg-primary/10" : ""
                  }`}
                >
                  <td className="p-2 font-mono text-sm max-w-xs truncate">
                    {player.currentProgress || "-"}
                    {player.isComplete && " ✓"}
                  </td>
                  <td className="p-2 font-medium">
                    {player.name}
                    {player.id === currentPlayerId && (
                      <span className="ml-2 text-xs text-primary">(You)</span>
                    )}
                  </td>
                  <td className="p-2 tabular-nums">{Math.round(player.wpm)}</td>
                  <td className="p-2 tabular-nums">
                    {(player.accuracy * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
