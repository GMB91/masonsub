"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";

interface TimesheetEntry {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  notes: string;
  hours_worked: number;
  is_overtime: boolean;
  client_files_accessed: string[];
}

interface WeeklySummary {
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  total_days: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export default function TimesheetPage() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [currentTimesheet, setCurrentTimesheet] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    total_hours: 0,
    regular_hours: 0,
    overtime_hours: 0,
    total_days: 0,
    status: 'draft'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Get start of current week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Generate week dates (Monday to Sunday)
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDates = getWeekDates(weekStart);

  // Calculate hours worked for a day
  const calculateHours = (startTime: string, endTime: string, breakMinutes: number) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) return 0;
    
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours - (breakMinutes / 60));
  };

  // Update entry and recalculate summary
  const updateEntry = (dateStr: string, field: keyof TimesheetEntry, value: any) => {
    const newEntries = [...entries];
    let entryIndex = newEntries.findIndex(e => e.date === dateStr);
    
    if (entryIndex === -1) {
      // Create new entry
      newEntries.push({
        date: dateStr,
        start_time: '',
        end_time: '',
        break_minutes: 30, // Default 30 min break
        notes: '',
        hours_worked: 0,
        is_overtime: false,
        client_files_accessed: []
      });
      entryIndex = newEntries.length - 1;
    }
    
    newEntries[entryIndex] = { ...newEntries[entryIndex], [field]: value };
    
    // Recalculate hours if time fields changed
    if (field === 'start_time' || field === 'end_time' || field === 'break_minutes') {
      const entry = newEntries[entryIndex];
      entry.hours_worked = calculateHours(entry.start_time, entry.end_time, entry.break_minutes);
      entry.is_overtime = entry.hours_worked > 8;
    }
    
    setEntries(newEntries);
    calculateWeeklySummary(newEntries);
    setSaveStatus('unsaved');
  };

  const calculateWeeklySummary = (entriesData: TimesheetEntry[]) => {
    const totalHours = entriesData.reduce((sum, entry) => sum + entry.hours_worked, 0);
    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(0, totalHours - 40);
    const totalDays = entriesData.filter(entry => entry.hours_worked > 0).length;
    
    setWeeklySummary({
      total_hours: totalHours,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      total_days: totalDays,
      status: weeklySummary.status // Preserve existing status
    });
  };

  const saveTimesheet = async () => {
    setSaveStatus('saving');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/timesheets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          week_start: weekStart.toISOString().split('T')[0],
          entries: entries,
          summary: weeklySummary
        })
      });
      
      if (response.ok) {
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Failed to save timesheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitTimesheet = async () => {
    await saveTimesheet();
    
    try {
      const response = await fetch('/api/timesheets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          week_start: weekStart.toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setCurrentTimesheet(result.timesheet);
        setWeeklySummary(prev => ({ ...prev, status: 'submitted' }));
      }
    } catch (error) {
      console.error('Failed to submit timesheet:', error);
    }
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Load timesheet data for current week
  const loadTimesheetData = async (weekStartDate: Date) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const weekStartStr = weekStartDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/timesheets/load?user_id=${user.id}&week_start=${weekStartStr}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setCurrentTimesheet(data.timesheet);
        setEntries(data.entries || []);
        setWeeklySummary(data.summary);
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Failed to load timesheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when week changes
  useEffect(() => {
    loadTimesheetData(weekStart);
  }, [weekStart, user?.id]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getEntryForDate = (dateStr: string) => {
    return entries.find(e => e.date === dateStr) || {
      date: dateStr,
      start_time: '',
      end_time: '',
      break_minutes: 30,
      notes: '',
      hours_worked: 0,
      is_overtime: false,
      client_files_accessed: []
    };
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600 h-8 w-8" />
            My Timesheets
          </h1>
          <p className="text-slate-600 mt-1">
            Track your daily work hours and submit for approval
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {saveStatus === 'unsaved' && (
            <span className="text-amber-600 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-green-600 text-sm flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousWeek}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Week
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-800">
                Week of {weekStart.toLocaleDateString('en-AU', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToCurrentWeek}
                className="text-blue-600 hover:text-blue-700"
              >
                Go to Current Week
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={goToNextWeek}
              className="flex items-center gap-2"
            >
              Next Week
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total Hours</p>
                <p className="text-2xl font-bold text-slate-800">
                  {weeklySummary.total_hours.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Regular Hours</p>
                <p className="text-2xl font-bold text-slate-800">
                  {weeklySummary.regular_hours.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-slate-600">Overtime</p>
                <p className="text-2xl font-bold text-slate-800">
                  {weeklySummary.overtime_hours.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Days Worked</p>
                <p className="text-2xl font-bold text-slate-800">
                  {weeklySummary.total_days}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Time Entry Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            Daily Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Start Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">End Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Break (min)</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 min-w-[200px]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {weekDates.map((date) => {
                  const dateStr = formatDate(date);
                  const entry = getEntryForDate(dateStr);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <tr 
                      key={dateStr} 
                      className={`border-b border-slate-100 ${
                        isWeekend ? 'bg-slate-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {formatDisplayDate(date)}
                        </div>
                        {isWeekend && (
                          <span className="text-xs text-slate-500">Weekend</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.start_time}
                          onChange={(e) => updateEntry(dateStr, 'start_time', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          disabled={weeklySummary.status === 'submitted' || weeklySummary.status === 'approved'}
                        />
                      </td>
                      
                      <td className="py-3 px-4">
                        <input
                          type="time"
                          value={entry.end_time}
                          onChange={(e) => updateEntry(dateStr, 'end_time', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          disabled={weeklySummary.status === 'submitted' || weeklySummary.status === 'approved'}
                        />
                      </td>
                      
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max="480"
                          value={entry.break_minutes}
                          onChange={(e) => updateEntry(dateStr, 'break_minutes', parseInt(e.target.value) || 0)}
                          className="w-20 border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          disabled={weeklySummary.status === 'submitted' || weeklySummary.status === 'approved'}
                        />
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            entry.is_overtime ? 'text-amber-600' : 'text-slate-800'
                          }`}>
                            {entry.hours_worked.toFixed(1)}
                          </span>
                          {entry.is_overtime && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                              OT
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={entry.notes}
                          onChange={(e) => updateEntry(dateStr, 'notes', e.target.value)}
                          placeholder="Add notes..."
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          disabled={weeklySummary.status === 'submitted' || weeklySummary.status === 'approved'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            weeklySummary.status === 'draft' ? 'bg-slate-100 text-slate-700' :
            weeklySummary.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
            weeklySummary.status === 'approved' ? 'bg-green-100 text-green-700' :
            'bg-red-100 text-red-700'
          }`}>
            {weeklySummary.status === 'draft' ? 'Draft' :
             weeklySummary.status === 'submitted' ? 'Submitted' :
             weeklySummary.status === 'approved' ? 'Approved' : 'Rejected'}
          </div>
          
          {weeklySummary.overtime_hours > 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
              ⚠️ {weeklySummary.overtime_hours.toFixed(1)}h overtime detected
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={saveTimesheet}
            disabled={isLoading || saveStatus === 'saving' || weeklySummary.status !== 'draft'}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={submitTimesheet}
            disabled={isLoading || weeklySummary.total_hours === 0 || weeklySummary.status !== 'draft'}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
}