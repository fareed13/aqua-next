'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useOrgStore } from '@/store/orgStore';
import { useAuth } from '@/hooks/useAuth';

// Admin-only editor is lazy so QuillEditor never ships in the public refund-policy bundle.
const RefundPolicyEditor = dynamic(
  () => import('./RefundPolicyEditor').then((m) => m.RefundPolicyEditor),
  { ssr: false },
);

export function RefundPolicy() {
  const organization = useOrgStore((s) => s.organization);
  const { isAdminLoggedIn } = useAuth();
  const refund = (organization as any)?.refund_policy ?? '';

  // Gate the client-only auth read behind mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAdmin = mounted && isAdminLoggedIn();

  return (
    <div className="refund-policy">
      <div className="bg-[#124e66] p-4 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl text-white mb-1">Refund Policy</h1>
            <p className="text-sm text-white/70 mb-0">Manage organization refund policy</p>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <RefundPolicyEditor />
      ) : (
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="bg-white border border-[#e0e0e0] rounded shadow-sm">
            <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] px-4 py-3 font-semibold">Refund Policy</div>
            <div className="p-6">
              {refund ? (
                <div className="prose max-w-none text-[#424242]" dangerouslySetInnerHTML={{ __html: refund }} />
              ) : (
                <p className="text-[#757575] italic">No refund policy has been set.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
