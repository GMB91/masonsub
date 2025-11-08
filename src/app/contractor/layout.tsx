// Mason Vector - Contractor Portal Layout
// Main layout for contractor portal with workspace tabs

import ContractorWorkspaceProvider from '@/components/contractor/ContractorWorkspaceProvider';

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Contractor Portal Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              Mason Vector - Contractor Portal
            </h1>
            <div className="text-sm text-gray-500">
              Claimant Management Workspace
            </div>
          </div>
          
          {/* User Info & Controls */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <div className="font-medium">Contractor Dashboard</div>
              <div className="text-xs text-gray-500">Assigned Claimants</div>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-500">Role</div>
              <div className="font-medium">Contractor</div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Workspace Content */}
      <div className="flex-1 overflow-hidden">
        <ContractorWorkspaceProvider>
          {children}
        </ContractorWorkspaceProvider>
      </div>
    </div>
  );
}