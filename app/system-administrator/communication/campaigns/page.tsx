"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Edit, Copy, BarChart3, Users, Mail, Calendar, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function CampaignsPage() {
  const campaigns = [
    {
      id: 1,
      name: "Q4 Claimant Outreach",
      type: "email",
      status: "active",
      startDate: "2025-11-01",
      endDate: "2025-12-31",
      recipients: 2547,
      sent: 1823,
      opened: 1247,
      clicked: 432,
      description: "Quarterly outreach to potential claimants with unclaimed funds over $1,000"
    },
    {
      id: 2,
      name: "Document Reminder Series",
      type: "multi-channel", 
      status: "running",
      startDate: "2025-10-15",
      endDate: "2025-11-15",
      recipients: 892,
      sent: 892,
      opened: 634,
      clicked: 189,
      description: "3-part reminder series for claimants who haven't submitted required documents"
    },
    {
      id: 3,
      name: "Holiday Payment Notice",
      type: "sms",
      status: "scheduled",
      startDate: "2025-12-15",
      endDate: "2025-12-15", 
      recipients: 156,
      sent: 0,
      opened: 0,
      clicked: 0,
      description: "Holiday schedule notification for payment processing delays"
    },
    {
      id: 4,
      name: "Annual Survey Campaign",
      type: "email",
      status: "completed",
      startDate: "2025-10-01", 
      endDate: "2025-10-31",
      recipients: 3421,
      sent: 3421,
      opened: 2156,
      clicked: 867,
      description: "Annual customer satisfaction survey for completed claims"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-50 text-blue-700';
      case 'sms': return 'bg-green-50 text-green-700';
      case 'multi-channel': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    return sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0';
  };

  const calculateClickRate = (clicked: number, opened: number) => {
    return opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0';
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Campaign operations use mock data. No real campaigns will be sent or modified.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 mt-1">Manage multi-channel communication campaigns</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(campaign.type)}>
                        {campaign.type}
                      </Badge>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {campaign.status === 'active' || campaign.status === 'running' ? (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{campaign.description}</p>
              
              {/* Campaign Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{campaign.recipients.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Recipients</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{campaign.sent.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Sent</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{calculateOpenRate(campaign.opened, campaign.sent)}%</div>
                  <div className="text-xs text-slate-500">Open Rate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{calculateClickRate(campaign.clicked, campaign.opened)}%</div>
                  <div className="text-xs text-slate-500">Click Rate</div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Start Date</span>
                  <div className="font-medium">{campaign.startDate}</div>
                </div>
                <div>
                  <span className="text-slate-500">End Date</span>
                  <div className="font-medium">{campaign.endDate}</div>
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
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