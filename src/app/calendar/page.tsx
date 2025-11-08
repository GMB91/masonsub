"use client";

import React, { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month");

  // Mock events data for demonstration
  const mockEvents = [
    {
      id: 1,
      title: "Follow-up Call with John Smith",
      description: "Check on claim status and required documents",
      reminder_type: "follow_up",
      claimant_name: "John Smith",
      due_date: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Document Review Meeting",
      description: "Review submitted documentation for Jane Doe",
      reminder_type: "meeting",
      claimant_name: "Jane Doe",
      due_date: new Date().toISOString(),
    },
  ];

  // Navigation handlers
  const handlePrev = () => {
    if (view === "month") {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (view === "month") {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    }
  };

  const formatHeaderTitle = () => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 gap-6 bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrev}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNext}
            className="p-2"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </Button>
          <h2 className="text-2xl font-bold text-slate-800">{formatHeaderTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            className={
              view === "month"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700"
            }
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
            className={
              view === "week"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700"
            }
          >
            Week
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => alert("Add Event functionality to be implemented")}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </div>
      </header>

      {/* Main Calendar + Agenda */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Calendar Main View */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          {view === "month" && (
            <div className="h-full">
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center font-medium text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 h-5/6">
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNumber = ((i - 5) % 31) + 1;
                  const isCurrentMonth = i >= 5 && i < 36;
                  const isToday = isCurrentMonth && dayNumber === new Date().getDate();
                  const isSelected = isCurrentMonth && dayNumber === selectedDate.getDate();
                  
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (isCurrentMonth) {
                          const newDate = new Date(currentDate);
                          newDate.setDate(dayNumber);
                          setSelectedDate(newDate);
                        }
                      }}
                      className={`
                        border border-slate-100 p-2 cursor-pointer hover:bg-slate-50 transition-colors
                        ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                        ${isToday ? 'bg-blue-100 border-blue-300' : ''}
                        ${isSelected ? 'bg-purple-100 border-purple-300' : ''}
                      `}
                    >
                      <div className="font-medium">{isCurrentMonth ? dayNumber : ''}</div>
                      {isCurrentMonth && dayNumber <= 2 && (
                        <div className="mt-1">
                          <div className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate">
                            Event
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {view === "week" && (
            <div className="h-full">
              <div className="text-center text-slate-600 py-4">
                <p>Week View - Coming Soon</p>
                <p className="text-sm text-slate-500 mt-2">
                  This view will show a detailed weekly calendar layout
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Agenda Panel */}
        <aside className="lg:w-1/3 xl:w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <Calendar className="text-blue-600 h-5 w-5" />
            <h3 className="text-lg font-semibold text-slate-800">Agenda</h3>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            {formatSelectedDate()}
          </p>

          {mockEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-slate-500 flex-1">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-medium">No events scheduled</p>
              <p className="text-sm mt-1">
                Click <span className="font-semibold">'Add Event'</span> to get
                started!
              </p>
            </div>
          ) : (
            <ul className="space-y-3 overflow-y-auto">
              {mockEvents.map((event) => (
                <li
                  key={event.id}
                  className="cursor-pointer border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {event.title}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        event.reminder_type === "meeting"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {event.reminder_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {event.claimant_name || "General event"}
                  </p>
                  {event.description && (
                    <p className="text-xs text-slate-400 mt-1">
                      {event.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
