"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Filter, 
  Download,
  Users,
  Calendar,
  DollarSign,
  Timer,
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";

interface TimesheetSubmission {
  id: string;
  contractor_id: string;
  contractor_name: string;
  contractor_email: string;
  week_start: string;
  week_end: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  hourly_rate: number | null;
  total_amount: number | null;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  submitted_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  entries: any[];
  flags: string[];
}

interface FilterState {
  status: string;
  dateRange: string;
  contractor: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdminTimesheetApproval() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<TimesheetSubmission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    dateRange: 'current_week',
    contractor: 'all',
    sortBy: 'submitted_at',
    sortOrder: 'desc'
  });

  // Summary stats
  const [stats, setStats] = useState({
    pending: 0,
    approved_this_week: 0,
    total_hours_pending: 0,
    total_amount_pending: 0,
    overtime_alerts: 0
  });

  // Load timesheet submissions
  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        status: filters.status,
        date_range: filters.dateRange,
        contractor: filters.contractor,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      });

      const response = await fetch(`/api/admin/timesheets?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and filter changes
  useEffect(() => {
    loadSubmissions();
  }, [filters]);

  // Approve timesheet
  const approveTimesheet = async (timesheetId: string) => {
    try {
      const response = await fetch('/api/admin/timesheets/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timesheet_id: timesheetId,
          approved_by: user?.id
        })
      });
      
      if (response.ok) {
        loadSubmissions(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to approve timesheet:', error);
    }
  };

  // Reject timesheet
  const rejectTimesheet = async (timesheetId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/timesheets/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timesheet_id: timesheetId,
          rejection_reason: reason,
          rejected_by: user?.id
        })
      });
      
      if (response.ok) {
        loadSubmissions(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to reject timesheet:', error);
    }
  };

  // Batch approve selected
  const batchApprove = async () => {
    try {
      const response = await fetch('/api/admin/timesheets/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timesheet_ids: selectedSubmissions,
          approved_by: user?.id
        })
      });
      
      if (response.ok) {
        setSelectedSubmissions([]);
        loadSubmissions();
      }
    } catch (error) {
      console.error('Failed to batch approve:', error);
    }
  };

  // Export to CSV
  const exportTimesheets = () => {
    const csvContent = [
      ['Contractor', 'Week Start', 'Total Hours', 'Overtime', 'Amount', 'Status', 'Submitted'].join(','),
      ...submissions.map(sub => [
        sub.contractor_name,
        sub.week_start,
        sub.total_hours,
        sub.overtime_hours,
        sub.total_amount || 0,
        sub.status,
        new Date(sub.submitted_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number | null) => {
    return amount ? `$${amount.toFixed(2)}` : '$0.00';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      paid: 'bg-purple-100 text-purple-700'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`;
  };

  const hasOvertimeFlag = (submission: TimesheetSubmission) => {
    return submission.overtime_hours > 0 || submission.flags?.includes('overtime');
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="text-green-600 h-8 w-8" />
            Timesheet Approvals
          </h1>
          <p className="text-slate-600 mt-1">
            Review and approve contractor timesheets
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={exportTimesheets}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          
          {selectedSubmissions.length > 0 && (
            <Button
              onClick={batchApprove}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Selected ({selectedSubmissions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Approved This Week</p>
                <p className="text-2xl font-bold text-slate-800">{stats.approved_this_week}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Hours Pending</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total_hours_pending.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Amount Pending</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.total_amount_pending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-slate-600">Overtime Alerts</p>
                <p className="text-2xl font-bold text-slate-800">{stats.overtime_alerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="current_week">Current Week</option>
                <option value="last_week">Last Week</option>
                <option value="current_month">Current Month</option>
                <option value="last_month">Last Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Contractor</label>
              <select
                value={filters.contractor}
                onChange={(e) => setFilters(prev => ({ ...prev, contractor: e.target.value }))}
                className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Contractors</option>
                {/* TODO: Populate with actual contractors */}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="submitted_at">Submitted Date</option>
                <option value="contractor_name">Contractor Name</option>
                <option value="total_hours">Total Hours</option>
                <option value="total_amount">Total Amount</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            Timesheet Submissions
            {isLoading && <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div 
                key={submission.id} 
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubmissions(prev => [...prev, submission.id]);
                        } else {
                          setSelectedSubmissions(prev => prev.filter(id => id !== submission.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    
                    <div>
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        {submission.contractor_name}
                        {hasOvertimeFlag(submission) && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                            OT
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Week of {formatDate(submission.week_start)} • {submission.total_hours.toFixed(1)} hours
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-slate-800">{formatCurrency(submission.total_amount)}</p>
                      <p className="text-sm text-slate-500">Submitted {formatDate(submission.submitted_at)}</p>
                    </div>
                    
                    <span className={getStatusBadge(submission.status)}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedSubmission(
                          expandedSubmission === submission.id ? null : submission.id
                        )}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {submission.status === 'submitted' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveTimesheet(submission.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) rejectTimesheet(submission.id, reason);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedSubmission === submission.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-slate-800 mb-2">Time Breakdown</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Regular Hours:</span>
                            <span>{submission.regular_hours.toFixed(1)}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overtime Hours:</span>
                            <span className={submission.overtime_hours > 0 ? 'text-amber-600 font-medium' : ''}>
                              {submission.overtime_hours.toFixed(1)}h
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total Hours:</span>
                            <span className="font-medium">{submission.total_hours.toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-800 mb-2">Payment Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Hourly Rate:</span>
                            <span>{formatCurrency(submission.hourly_rate)}/hr</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total Amount:</span>
                            <span className="font-medium">{formatCurrency(submission.total_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {submission.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {submission.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {submissions.length === 0 && !isLoading && (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No timesheet submissions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}