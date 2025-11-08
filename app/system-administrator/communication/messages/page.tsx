"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Reply, Forward, Archive, Search, Filter, Mail, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function MessagesPage() {
  const messages = [
    {
      id: 1,
      from: "John Smith",
      email: "j.smith@email.com",
      subject: "Question about claim verification",
      preview: "I received your email about unclaimed funds but I'm not sure about the documents you need...",
      timestamp: "2025-11-06 10:30 AM",
      status: "unread",
      type: "inquiry",
      priority: "medium"
    },
    {
      id: 2,
      from: "Sarah Johnson", 
      email: "sarah.j@email.com",
      subject: "Re: Document submission confirmation",
      preview: "Thank you for confirming receipt of my documents. When can I expect the next step?",
      timestamp: "2025-11-06 9:15 AM", 
      status: "replied",
      type: "follow-up",
      priority: "low"
    },
    {
      id: 3,
      from: "Michael Brown",
      email: "m.brown@email.com", 
      subject: "URGENT: Payment processing issue",
      preview: "There seems to be an issue with my payment. I was expecting it last week but haven't received anything...",
      timestamp: "2025-11-06 8:45 AM",
      status: "unread", 
      type: "complaint",
      priority: "high"
    },
    {
      id: 4,
      from: "Lisa Davis",
      email: "lisa.davis@email.com",
      subject: "Thank you for your help",
      preview: "I wanted to express my gratitude for the excellent service. The process was smooth and professional...",
      timestamp: "2025-11-05 4:20 PM",
      status: "archived",
      type: "feedback", 
      priority: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inquiry': return <MessageSquare className="h-4 w-4" />;
      case 'complaint': return <AlertCircle className="h-4 w-4" />;
      case 'follow-up': return <Clock className="h-4 w-4" />;
      case 'feedback': return <Mail className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Message operations use mock data. No real messages will be sent or modified.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 mt-1">Manage claimant communications and inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {messages.map((message) => (
          <Card key={message.id} className={`hover:shadow-md transition-shadow cursor-pointer ${
            message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getTypeIcon(message.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className={`text-base truncate ${
                        message.status === 'unread' ? 'font-bold' : 'font-semibold'
                      }`}>
                        {message.from}
                      </CardTitle>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{message.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Forward className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h4 className={`font-medium mb-2 ${
                message.status === 'unread' ? 'font-bold' : ''
              }`}>
                {message.subject}
              </h4>
              <p className="text-sm text-slate-600 mb-3">{message.preview}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{message.timestamp}</span>
                <Badge variant="outline" className="text-xs">
                  {message.type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}