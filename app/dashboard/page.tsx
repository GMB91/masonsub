"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/dev-login');
        return;
      }

      // Redirect based on user role
      const roleRedirects = {
        admin: '/system-administrator/admin/main/dashboard',
        manager: '/system-administrator/admin/main/dashboard',
        contractor: '/system-administrator/admin/main/dashboard', // For now, all go to admin
        client: '/system-administrator/admin/main/dashboard'
      };

      const redirectPath = roleRedirects[user.role as keyof typeof roleRedirects] || '/system-administrator/admin/main/dashboard';
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}