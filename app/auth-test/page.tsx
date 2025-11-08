"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthTestPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/dev-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        {user ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h2 className="font-semibold text-green-800 mb-2">✅ Authenticated Successfully!</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">User ID:</span> {user.id}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Role:</span> <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">{user.role}</span></p>
                <p><span className="font-medium">Full Name:</span> {user.full_name}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
              
              <button
                onClick={() => router.push('/auth/dev-login')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Back to Dev Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h2 className="font-semibold text-red-800 mb-2">❌ Not Authenticated</h2>
              <p className="text-sm text-red-700">Please sign in using the development login.</p>
            </div>
            
            <button
              onClick={() => router.push('/auth/dev-login')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Dev Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}