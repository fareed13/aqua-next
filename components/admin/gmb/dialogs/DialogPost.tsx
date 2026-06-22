'use client'
export default function DialogPost({ post, onClose }: { post?: any; onClose?: () => void }) {
  if (!post) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Post Detail</h3>
        <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(post, null, 2)}</pre>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">Close</button>
      </div>
    </div>
  )
}
