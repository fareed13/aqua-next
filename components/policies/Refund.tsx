'use client';

import { useOrgStore } from '@/store/orgStore';

export function RefundPolicy() {
  const organization = useOrgStore((s) => s.organization);
  const refund = organization?.refund_policy ?? '';

  return (
    <div className="refund-policy">
      <div className="bg-[#124e66] p-4 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl text-white mb-1">Refund Policy</h1>
            <p className="text-sm text-white/70 mb-0">Organization refund policy</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-white border border-[#e0e0e0] rounded shadow-sm">
          <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] px-4 py-3 font-semibold">
            Refund Policy
          </div>
          <div className="p-6">
            {refund ? (
              <div
                className="prose max-w-none text-[#424242]"
                dangerouslySetInnerHTML={{ __html: refund }}
              />
            ) : (
              <p className="text-[#757575] italic">No refund policy has been set.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
