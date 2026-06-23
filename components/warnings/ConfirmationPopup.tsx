'use client'

interface Props {
  popup: boolean
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
  message: string
}

export function ConfirmationPopup({ popup, onConfirm, onCancel, loading, message }: Props) {
  if (!popup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={!loading ? onCancel : undefined} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-sky-500 px-4 py-3 rounded-t-lg">
          <h2 className="text-white font-semibold text-lg">Confirmation</h2>
        </div>
        <div className="px-4 py-4 text-gray-800">
          {message || 'Do You Really want to Book this appointment?'}
        </div>
        <div className="px-4 py-3 flex justify-end gap-2 border-t">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Loading…' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
