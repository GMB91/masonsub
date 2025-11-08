"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye, Download, RefreshCw, Search, Filter, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function PaymentsPage() {
  const payments = [
    {
      id: "PAY-2025-001",
      claimId: "CLM-2025-001",
      recipient: "John Smith",
      amount: 15750.00,
      method: "Bank Transfer",
      status: "completed",
      processedDate: "2025-11-05",
      reference: "BT-20251105-001"
    },
    {
      id: "PAY-2025-002",
      claimId: "CLM-2025-003", 
      recipient: "Michael Brown",
      amount: 3456.78,
      method: "Cheque",
      status: "processing",
      processedDate: "2025-11-06",
      reference: "CHQ-20251106-002"
    },
    {
      id: "PAY-2025-003",
      claimId: "CLM-2025-005",
      recipient: "Emma Wilson", 
      amount: 7890.00,
      method: "Bank Transfer",
      status: "pending",
      processedDate: null,
      reference: null
    },
    {
      id: "PAY-2025-004",
      claimId: "CLM-2025-004",
      recipient: "Lisa Davis",
      amount: 22100.00,
      method: "Bank Transfer", 
      status: "failed",
      processedDate: "2025-11-04",
      reference: "BT-20251104-004"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800'; 
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Bank Transfer': return 'bg-blue-50 text-blue-700';
      case 'Cheque': return 'bg-green-50 text-green-700';
      case 'PayPal': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Payment data is simulated. No real financial transactions will be processed.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">Track and manage payment processing</p>
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
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <div>
                    <CardTitle className="text-lg">{payment.id}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                      <Badge className={getMethodColor(payment.method)}>
                        {payment.method}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  {payment.status === 'failed' && (
                    <Button variant="outline" size="sm" className="text-orange-600">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500 text-sm">Recipient</span>
                  <div className="font-medium">{payment.recipient}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Amount</span>
                  <div className="font-bold text-green-600">${payment.amount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Claim ID</span>
                  <div className="font-medium">{payment.claimId}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Processed Date</span>
                  <div className="font-medium">{payment.processedDate || 'Not processed'}</div>
                </div>
              </div>
              {payment.reference && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-slate-500 text-sm">Reference: </span>
                  <span className="font-mono text-sm">{payment.reference}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}