// Mason Vector - Contractor Claimants Layout
// Workspace layout for contractor claimant management

import ContractorWorkspaceProvider from '@/components/contractor/ContractorWorkspaceProvider';

export default function ContractorClaimantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <ContractorWorkspaceProvider>
        {children}
      </ContractorWorkspaceProvider>
    </div>
  );
}