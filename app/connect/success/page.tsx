import { InstagramSuccess } from '@/components/connect/InstagramSuccess'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ConnectSuccessPage() {
  return <InstagramSuccess />
}
