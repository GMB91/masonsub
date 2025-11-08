import { Smartphone, QrCode, Key, Shield, CheckCircle, XCircle, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function MFASetupPage() {
  const mfaStats = {
    totalUsers: 18,
    mfaEnabled: 12,
    pendingSetup: 6,
    lastUpdate: "2025-11-06 10:30:00"
  };

  const mfaMethods = [
    {
      name: "Authenticator App",
      description: "Use Google Authenticator, Authy, or similar TOTP apps",
      enabled: true,
      users: 8,
      icon: Smartphone
    },
    {
      name: "SMS Text Message",
      description: "Receive verification codes via SMS",
      enabled: true,
      users: 4,
      icon: Key
    },
    {
      name: "Hardware Security Key",
      description: "FIDO2/WebAuthn compatible security keys",
      enabled: false,
      users: 0,
      icon: Shield
    }
  ];

  const userMFAStatus = [
    { name: "Admin User", email: "admin@masonvector.com", method: "Authenticator", status: "active" },
    { name: "John Smith", email: "john.smith@masonvector.com", method: "SMS", status: "active" },
    { name: "Jane Doe", email: "jane.doe@masonvector.com", method: "Authenticator", status: "active" },
    { name: "Bob Wilson", email: "bob.wilson@masonvector.com", method: "None", status: "pending" },
    { name: "Sarah Johnson", email: "sarah.j@masonvector.com", method: "SMS", status: "active" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Multi-Factor Authentication Setup</h1>
          <p className="text-slate-600">Configure and manage MFA settings for enhanced security</p>
        </div>
        <Link 
          href="/system-admin" 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* MFA Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{mfaStats.totalUsers}</p>
              <p className="text-sm text-slate-600">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{mfaStats.mfaEnabled}</p>
              <p className="text-sm text-slate-600">MFA Enabled</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <XCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{mfaStats.pendingSetup}</p>
              <p className="text-sm text-slate-600">Pending Setup</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">67%</p>
              <p className="text-sm text-slate-600">Coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* MFA Methods */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Smartphone size={20} />
            Available MFA Methods
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {mfaMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${method.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Icon className={method.enabled ? 'text-green-600' : 'text-gray-400'} size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{method.name}</h4>
                      <p className="text-slate-600 text-sm">{method.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {method.users} user{method.users !== 1 ? 's' : ''} using this method
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      method.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-sm">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User MFA Status */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users size={20} />
            User MFA Status
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {userMFAStatus.map((user, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{user.name}</h4>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">{user.method}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Pending Setup'}
                    </span>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    {user.status === 'active' ? 'Manage' : 'Setup'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <QrCode size={20} />
          Quick Setup Guide
        </h3>
        <div className="space-y-3 text-blue-700">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">1</span>
            <p>Download an authenticator app (Google Authenticator, Authy, or Microsoft Authenticator)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">2</span>
            <p>Navigate to Account Settings and select "Enable Multi-Factor Authentication"</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">3</span>
            <p>Scan the QR code with your authenticator app and enter the verification code</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">4</span>
            <p>Save your backup codes in a secure location</p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Settings size={20} />
          Admin Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <Shield className="text-indigo-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Enforce MFA</h4>
              <p className="text-sm text-slate-600">Require for all users</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <Users className="text-indigo-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Bulk Setup</h4>
              <p className="text-sm text-slate-600">Setup multiple users</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <Key className="text-indigo-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Reset Codes</h4>
              <p className="text-sm text-slate-600">Generate new backup codes</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}