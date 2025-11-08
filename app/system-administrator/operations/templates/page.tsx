"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Trash2, FileText, Mail, MessageSquare, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function TemplatesPage() {
  const templates = [
    {
      id: 1,
      name: "Initial Claimant Contact",
      type: "email",
      category: "Communication",
      lastModified: "2025-11-05",
      status: "active",
      usage: 142,
      description: "First email sent to potential claimants about unclaimed funds"
    },
    {
      id: 2,
      name: "Document Request Letter", 
      type: "letter",
      category: "Legal",
      lastModified: "2025-11-04",
      status: "active",
      usage: 87,
      description: "Formal letter requesting verification documents from claimants"
    },
    {
      id: 3,
      name: "Payment Notification",
      type: "email",
      category: "Financial",
      lastModified: "2025-11-03",
      status: "draft",
      usage: 0,
      description: "Notification sent when payment is processed and dispatched"
    },
    {
      id: 4,
      name: "Compliance Report Template",
      type: "document",
      category: "Reporting",
      lastModified: "2025-11-02",
      status: "active",
      usage: 23,
      description: "Standard template for regulatory compliance reporting"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'letter': return <FileText className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Template operations use mock data. No real templates will be modified.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-500 mt-1">Manage document and communication templates</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(template.type)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{template.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Type</span>
                  <div className="font-medium capitalize">{template.type}</div>
                </div>
                <div>
                  <span className="text-slate-500">Last Modified</span>
                  <div className="font-medium">{template.lastModified}</div>
                </div>
                <div>
                  <span className="text-slate-500">Usage Count</span>
                  <div className="font-medium">{template.usage} times</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}