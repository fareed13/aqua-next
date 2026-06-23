'use client'

import { useOrgStore } from '@/store/orgStore'

export function UnderMaintenance() {
  const organization = useOrgStore((s) => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#667eea'

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)` }}
    >
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          'w-20 h-20 top-[20%] left-[10%] animate-[float_6s_ease-in-out_infinite]',
          'w-30 h-30 top-[60%] right-[15%] animate-[float_6s_ease-in-out_2s_infinite]',
          'w-16 h-16 bottom-[20%] left-[20%] animate-[float_6s_ease-in-out_4s_infinite]',
          'w-24 h-24 top-[30%] right-[30%] animate-[float_6s_ease-in-out_1s_infinite]',
        ].map((cls, i) => (
          <div key={i} className={`absolute rounded-full bg-white/10 ${cls}`} />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 max-w-lg w-full text-center animate-[slideInUp_0.8s_ease-out]">
          {/* Rotating icon */}
          <div className="relative inline-block mb-8">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg animate-spin"
              style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`, animationDuration: '3s' }}
            >
              <svg className="w-14 h-14 text-white" style={{ animation: 'counterRotate 3s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-purple-300/30 animate-ping"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </div>

          <h1 className="text-4xl font-bold mb-4" style={{ color: accentColor }}>
            Site Under Maintenance
          </h1>
          <p className="text-lg text-gray-600 font-medium mb-3">
            We&apos;re currently performing scheduled maintenance
          </p>
          <p className="text-gray-500 leading-relaxed">
            Our team is working hard to improve your experience. We&apos;ll be back online shortly. Thank you for your patience!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes counterRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}
