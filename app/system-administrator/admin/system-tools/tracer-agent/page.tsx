"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, FileText, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function TracerAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "👋 Hello! I'm the Tracer Agent. I can help you search for unclaimed money across multiple Australian states. What would you like to search for?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `🔍 Searching for "${input}"...\n\n✅ Found 3 potential matches:\n\n1. **QLD Public Trustee** - $2,450\n2. **NSW Unclaimed Money** - $1,850\n3. **ASIC Gazette** - $5,200\n\nWould you like me to investigate any of these further?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Tracer Agent using simulated responses.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tracer Agent</h1>
        <p className="text-slate-500 mt-1">AI-powered unclaimed money discovery across Australian states</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-8rem)]">
        {/* Main Chat Area */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-indigo-600" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === "user" ? "text-indigo-200" : "text-slate-500"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-lg p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me to search for unclaimed money..."
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Evidence & Context */}
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Evidence Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">Active Sources</h4>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>✅ QLD Public Trustee</li>
                  <li>✅ NSW Unclaimed Money</li>
                  <li>✅ VIC State Revenue</li>
                  <li>✅ ASIC Gazette</li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-semibold text-sm text-green-900 mb-2">Search Stats</h4>
                <div className="space-y-1 text-xs text-green-700">
                  <p>Queries: 3</p>
                  <p>Matches Found: 8</p>
                  <p>Avg Response: 1.2s</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <h4 className="font-semibold text-sm text-slate-900 mb-2">Working Theory</h4>
                <p className="text-xs text-slate-600">
                  Based on search patterns, focusing on NSW and QLD databases for matches.
                  Prioritizing entries with amounts over $1,000.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
