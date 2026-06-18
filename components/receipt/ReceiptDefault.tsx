'use client';

import { useOrgStore } from '@/store/orgStore';
import { useUiStore } from '@/store/uiStore';

export function ReceiptDefault() {
  const organization = useOrgStore((s) => s.organization);
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  return (
    <div className="py-16 px-4 text-center max-w-2xl mx-auto">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white text-3xl mb-6"
        style={{ background: accentColor }}
      >
        &#10003;
      </div>
      <h1 className="text-3xl font-bold text-black mt-4 mb-4">
        Welcome!
      </h1>
      <p className="text-gray-700 mb-4">
        We are looking forward to seeing you! We have emailed you a receipt. Please present your
        receipt when you arrive for your first class. If you have not scheduled an appointment,
        please contact our facility to schedule your first class.
      </p>
      <p className="text-gray-600 text-sm">
        Someone will reach out shortly with more details about getting you enrolled in your first class!
      </p>
    </div>
  );
}
