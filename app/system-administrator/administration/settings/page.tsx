"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Mail, Shield, Globe, Bell, Clock, Save, AlertCircle, Toggle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: "Mason Vector Data Gather",
    timezone: "Australia/Sydney",
    defaultLanguage: "English",
    maintenanceMode: false,
    
    // Security Settings
    sessionTimeout: 120,
    passwordExpiry: 90,
    twoFactorRequired: true,
    loginAttempts: 5,
    
    // Email Settings
    smtpHost: "mail.masonvector.com",
    smtpPort: 587,
    smtpUser: "noreply@masonvector.com",
    emailNotifications: true,
    
    // Data Collection Settings
    batchSize: 1000,
    retryAttempts: 3,
    collectionInterval: 6,
    autoBackup: true,
    
    // Notification Settings
    slackIntegration: true,
    smsAlerts: false,
    webhookUrl: "https://hooks.slack.com/services/...",
    alertThreshold: 85
  });

  const settingsSections = [
    {
      title: "System Configuration",
      icon: Settings,
      items: [
        { key: "systemName", label: "System Name", type: "text" },
        { key: "timezone", label: "Timezone", type: "select", options: ["Australia/Sydney", "Australia/Melbourne", "UTC"] },
        { key: "defaultLanguage", label: "Default Language", type: "select", options: ["English", "Spanish", "French"] },
        { key: "maintenanceMode", label: "Maintenance Mode", type: "toggle" }
      ]
    },
    {
      title: "Security Settings", 
      icon: Shield,
      items: [
        { key: "sessionTimeout", label: "Session Timeout (minutes)", type: "number" },
        { key: "passwordExpiry", label: "Password Expiry (days)", type: "number" },
        { key: "twoFactorRequired", label: "Require 2FA", type: "toggle" },
        { key: "loginAttempts", label: "Max Login Attempts", type: "number" }
      ]
    },
    {
      title: "Email Configuration",
      icon: Mail,
      items: [
        { key: "smtpHost", label: "SMTP Host", type: "text" },
        { key: "smtpPort", label: "SMTP Port", type: "number" },
        { key: "smtpUser", label: "SMTP Username", type: "text" },
        { key: "emailNotifications", label: "Enable Email Notifications", type: "toggle" }
      ]
    },
    {
      title: "Data Collection",
      icon: Database,
      items: [
        { key: "batchSize", label: "Batch Size", type: "number" },
        { key: "retryAttempts", label: "Retry Attempts", type: "number" },
        { key: "collectionInterval", label: "Collection Interval (hours)", type: "number" },
        { key: "autoBackup", label: "Auto Backup", type: "toggle" }
      ]
    },
    {
      title: "Notifications & Alerts",
      icon: Bell,
      items: [
        { key: "slackIntegration", label: "Slack Integration", type: "toggle" },
        { key: "smsAlerts", label: "SMS Alerts", type: "toggle" },
        { key: "webhookUrl", label: "Webhook URL", type: "text" },
        { key: "alertThreshold", label: "Alert Threshold (%)", type: "number" }
      ]
    }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderInput = (item: any) => {
    const value = settings[item.key as keyof typeof settings];
    
    switch (item.type) {
      case "toggle":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSettingChange(item.key, !value)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                value ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                value ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <span className="text-sm text-slate-600">{value ? 'Enabled' : 'Disabled'}</span>
          </div>
        );
      
      case "select":
        return (
          <select 
            value={value as string}
            onChange={(e) => handleSettingChange(item.key, e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {item.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case "number":
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleSettingChange(item.key, parseInt(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleSettingChange(item.key, e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Settings changes are simulated and won't affect the real system configuration.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.items.map((item) => (
                    <div key={item.key} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        {item.label}
                      </label>
                      {renderInput(item)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Database</span>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Email Service</span>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium">Backup Service</span>
              <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}