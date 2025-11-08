"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Trash2, Mail, MessageSquare, FileText, Eye, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function CommunicationTemplatesPage() {
  const templates = [
    {
      id: 1,
      name: "Welcome Email",
      type: "email",
      category: "Onboarding",
      lastModified: "2025-11-05",
      status: "active",
      usage: 234,
      openRate: 78.5,
      description: "Initial welcome message for new claimants"
    },
    {
      id: 2,
      name: "Document Request",
      type: "email", 
      category: "Verification",
      lastModified: "2025-11-04",
      status: "active",
      usage: 156,
      openRate: 82.1,
      description: "Request for additional verification documents"
    },
    {
      id: 3,
      name: "Payment Confirmation SMS",
      type: "sms",
      category: "Notifications",
      lastModified: "2025-11-03",
      status: "active", 
      usage: 89,
      openRate: 95.2,
      description: "SMS notification confirming payment processing"
    },
    {
      id: 4,
      name: "Follow-up Letter",
      type: "letter",
      category: "Engagement",
      lastModified: "2025-11-02",
      status: "draft",
      usage: 0,
      openRate: 0,
      description: "Physical letter for non-responsive claimants"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'letter': return <FileText className="h-4 w-4 text-purple-500" />;
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
            <p className="text-sm text-yellow-700">Communication template operations use mock data only.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Communication Templates</h1>
          <p className="text-slate-500 mt-1">Manage email, SMS, and letter templates for claimant communication</p>
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
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {template.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Usage Count</span>
                  <div className="font-medium">{template.usage} times</div>
                </div>
                <div>
                  <span className="text-slate-500">Open Rate</span>
                  <div className="font-medium text-green-600">{template.openRate}%</div>
                </div>
                <div>
                  <span className="text-slate-500">Last Modified</span>
                  <div className="font-medium">{template.lastModified}</div>
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <Badge className={getStatusColor(template.status)}>
                    {template.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}