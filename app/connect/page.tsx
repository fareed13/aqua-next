import { InstagramConnect } from '@/components/connect/InstagramConnect'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ConnectPage() {
  return <InstagramConnect />
}
