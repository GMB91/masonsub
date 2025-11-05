// [AUTO-GEN-START] StatusBreakdown component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, status visualization

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusData {
  status: string;
  count: number;
  color: string;
}

interface StatusBreakdownProps {
  data?: StatusData[];
  title?: string;
}

export function StatusBreakdown({ 
  data = [], 
  title = "Status Breakdown" 
}: StatusBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.status}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-sm font-semibold">{total}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatusBreakdown;
// [AUTO-GEN-END]
