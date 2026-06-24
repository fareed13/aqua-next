'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/lib/utils/menuItems'

interface NavMenuProps {
  items: MenuItem[]
  onNavigate?: () => void
}

function NavItem({ item, onNavigate }: { item: MenuItem; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false)
  const hasChildren = (item.children?.length ?? 0) > 0

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          {item.name}
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {open && (
          <div className="border-l-2 border-gray-100 ml-4">
            {item.children!.map((child) => (
              <NavItem key={child.name} item={child} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!item.url) return null

  const isExternal = item.external && item.url.startsWith('http')

  if (isExternal) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
        onClick={onNavigate}
      >
        {item.name}
      </a>
    )
  }

  return (
    <Link
      href={item.url}
      className={cn('block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50')}
      onClick={onNavigate}
    >
      {item.name}
    </Link>
  )
}

export function NavMenu({ items, onNavigate }: NavMenuProps) {
  return (
    <nav aria-label="Main navigation menu">
      {items.map((item) => (
        <NavItem key={item.name} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}
