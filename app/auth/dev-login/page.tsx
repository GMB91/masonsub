"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DevLoginPage() {
  const router = useRouter();
  const { devSignIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDevLogin = async (role: 'admin' | 'manager' | 'contractor' | 'client') => {
    setLoading(true);
    try {
      await devSignIn(role);
      
      // Redirect based on role
      const redirects = {
        admin: '/dashboard',
        manager: '/dashboard', 
        contractor: '/dashboard',
        client: '/dashboard'
      };
      
      router.push(redirects[role]);
    } catch (error) {
      console.error('Dev login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mason Vector</h1>
          <p className="text-gray-600 mt-2">Development Login</p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Quick Sign In As:</h2>
          
          <button
            onClick={() => handleDevLogin('admin')}
            disabled={loading}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-900">System Administrator</div>
                <div className="text-sm text-gray-600">Full system access • admin@dev.masonvector.com</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleDevLogin('manager')}
            disabled={loading}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-green-900">Manager</div>
                <div className="text-sm text-gray-600">Team management • manager@dev.masonvector.com</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleDevLogin('contractor')}
            disabled={loading}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6a2 2 0 002 2v0a2 2 0 002-2v-6zM8 6v6a2 2 0 01-2 2v0a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-purple-900">Contractor</div>
                <div className="text-sm text-gray-600">Timesheet management • contractor@dev.masonvector.com</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleDevLogin('client')}
            disabled={loading}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-orange-900">Client</div>
                <div className="text-sm text-gray-600">Portal access • client@dev.masonvector.com</div>
              </div>
            </div>
          </button>
        </div>

        {/* Development Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">Development Mode</span>
          </div>
          <p className="text-xs text-yellow-700">
            These are mock accounts for testing. No real authentication required.
          </p>
        </div>

        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Signing in...</span>
          </div>
        )}
      </div>
    </div>
  );
}