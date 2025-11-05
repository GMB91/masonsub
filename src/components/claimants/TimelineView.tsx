// [AUTO-GEN-START] TimelineView component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, activity timeline

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: "created" | "updated" | "status_change" | "note" | "other";
  actor?: string;
  metadata?: Record<string, any>;
}

interface TimelineViewProps {
  events: TimelineEvent[];
  title?: string;
}

export function TimelineView({ 
  events, 
  title = "Activity Timeline" 
}: TimelineViewProps) {
  const getTypeColor = (type?: string) => {
    switch (type) {
      case "created":
        return "bg-green-500";
      case "updated":
        return "bg-blue-500";
      case "status_change":
        return "bg-purple-500";
      case "note":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case "created":
        return "Created";
      case "updated":
        return "Updated";
      case "status_change":
        return "Status Changed";
      case "note":
        return "Note Added";
      default:
        return "Event";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet</p>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />

            {/* Timeline Events */}
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline Dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full ${getTypeColor(
                        event.type
                      )} border-4 border-white shadow`}
                    />
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      {/* Event Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {getTypeLabel(event.type)}
                            {event.actor && ` • by ${event.actor}`}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>

                      {/* Event Description */}
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>
                      )}

                      {/* Event Metadata */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium text-gray-500">
                                  {key}:
                                </span>{" "}
                                <span className="text-gray-700">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TimelineView;
// [AUTO-GEN-END]
