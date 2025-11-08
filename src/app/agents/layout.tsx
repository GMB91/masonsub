import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AgentsLayoutProps {
  children: ReactNode;
}

export default async function AgentsLayout({ children }: AgentsLayoutProps) {
  // TODO: Implement proper authentication check
  // For now, allowing access to demonstrate the interface
  // In production, add proper session validation here
  
  try {
    // Simulate auth check - replace with actual auth implementation
    const isAuthenticated = true; // Replace with real auth logic
    
    if (!isAuthenticated) {
      redirect("/login");
    }

    // Log agent access for audit purposes
    console.log(`Agent access at ${new Date().toISOString()}`);

  } catch (error) {
    console.error("Layout auth check failed:", error);
    redirect("/login");
  }

  return (
    <section className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 mb-6">
        <h1 className="text-2xl font-bold">Mason Vector AI Agents</h1>
        <p className="text-indigo-100 mt-1">
          Secure access to AI-powered data analysis and automation tools
        </p>
      </div>
      <div className="flex-1 px-4 pb-4">
        {children}
      </div>
    </section>
  );
}