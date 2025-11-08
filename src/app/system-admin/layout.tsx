// import { supabaseServer } from "../../lib/supabaseClient";
// import { redirect } from "next/navigation";

export default async function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add Supabase authentication and admin role checking
  // For now, this is a placeholder implementation
  // 
  // const supabase = supabaseServer;
  // const { data: { session }, error } = await supabase.auth.getSession();
  // 
  // if (!session || error) {
  //   redirect("/auth/login");
  // }
  // 
  // const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
  // if (userRole !== "admin") {
  //   redirect("/unauthorized");
  // }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">System Administration</h1>
            <p className="text-slate-600 text-sm">Restricted to authorized administrators only</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Admin Access</span>
            <span className="font-medium text-slate-700">System Administrator</span>
          </div>
        </div>
      </div>
      
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}