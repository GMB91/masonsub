"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge";
import { DollarSign, Eye, Edit, Download, Search, Filter, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function ClaimsPage() {
  const claims = [
    {
      id: "CLM-2025-001",
      claimant: "John Smith",
      amount: 15750.00,
      status: "approved",
      submitted: "2025-11-01",
      lastUpdate: "2025-11-05",
      type: "Unclaimed Funds",
      state: "NSW"
    },
    {
      id: "CLM-2025-002", 
      claimant: "Sarah Johnson",
      amount: 8923.45,
      status: "pending",
      submitted: "2025-11-03",
      lastUpdate: "2025-11-06",
      type: "Insurance Payout",
      state: "VIC"
    },
    {
      id: "CLM-2025-003",
      claimant: "Michael Brown", 
      amount: 3456.78,
      status: "processing",
      submitted: "2025-10-28",
      lastUpdate: "2025-11-04",
      type: "Bank Deposit",
      state: "QLD"
    },
    {
      id: "CLM-2025-004",
      claimant: "Lisa Davis",
      amount: 22100.00,
      status: "rejected",
      submitted: "2025-10-15",
      lastUpdate: "2025-10-25",
      type: "Shares Dividend",
      state: "SA"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
            <p className="text-sm text-yellow-700">Claims data is simulated. No real financial operations will be performed.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Claims</h1>
          <p className="text-slate-500 mt-1">Manage and track claimant financial claims</p>
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {claims.map((claim) => (
          <Card key={claim.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <CardTitle className="text-lg">{claim.id}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(claim.status)}>
                        {getStatusIcon(claim.status)}
                        <span className="ml-1 capitalize">{claim.status}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {claim.state}
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
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500 text-sm">Claimant</span>
                  <div className="font-medium">{claim.claimant}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Amount</span>
                  <div className="font-bold text-green-600">${claim.amount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Type</span>
                  <div className="font-medium">{claim.type}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Submitted</span>
                  <div className="font-medium">{claim.submitted}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}