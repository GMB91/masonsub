// [AUTO-GEN-START] ConversationHistory component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, chat message list

"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ConversationHistoryProps {
  messages: Message[];
  title?: string;
  autoScroll?: boolean;
}

export function ConversationHistory({
  messages,
  title = "Conversation History",
  autoScroll = true,
}: ConversationHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.created_at}
                metadata={message.metadata}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConversationHistory;
// [AUTO-GEN-END]
