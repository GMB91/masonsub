'use client';

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useClaimantWorkspace } from '../../../lib/state/useClaimantWorkspace';

export default function ClaimantDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { openTab } = useClaimantWorkspace();

  useEffect(() => {
    // Redirect to main claimants page and open this claimant in a tab
    const claimantId = params.id;
    
    // Open the tab
    openTab(claimantId, `Claimant ${claimantId}`);
    
    // Redirect to main claimants page
    router.replace('/claimants');
  }, [params.id, openTab, router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Opening claimant in workspace...</div>
      </div>
    </div>
  );
}
