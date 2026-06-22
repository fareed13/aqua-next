'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function OAuth2CallbackContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    const codeParam = searchParams.get('code')
    setCode(codeParam)
    setLoading(false)
  }, [searchParams])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 mt-20">
      <h1 className="text-3xl font-bold mb-4">OAuth Callback</h1>
      {loading ? (
        <p>Processing...</p>
      ) : (
        <p>Access Token: {code}</p>
      )}
    </div>
  )
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense>
      <OAuth2CallbackContent />
    </Suspense>
  )
}
