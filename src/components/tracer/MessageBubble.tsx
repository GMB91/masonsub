// [AUTO-GEN-START] MessageBubble component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, chat message component

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  timestamp?: string;
  metadata?: Record<string, any>;
  className?: string;
}

export function MessageBubble({
  content,
  role,
  timestamp,
  metadata,
  className,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div
      className={cn(
        "flex flex-col mb-4",
        isUser ? "items-end" : "items-start",
        className
      )}
    >
      {/* Role Label */}
      {!isSystem && (
        <div className="text-xs text-muted-foreground mb-1 px-1">
          {isUser ? "You" : "Assistant"}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser
            ? "bg-blue-600 text-white"
            : isSystem
            ? "bg-gray-100 text-gray-600 text-sm italic"
            : "bg-gray-200 text-gray-900"
        )}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-2 pt-2 border-t border-opacity-20 text-xs opacity-75">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key}>
                <span className="font-semibold">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp */}
      {timestamp && (
        <div className="text-xs text-muted-foreground mt-1 px-1">
          {new Date(timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
// [AUTO-GEN-END]
