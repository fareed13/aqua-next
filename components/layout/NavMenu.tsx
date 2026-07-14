'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, MapPin, Star, GraduationCap, Clock,
  Calendar, Newspaper, FileText, Gift, Phone, Link2,
  Home, LayoutDashboard, Users, Timer, BookCopy,
  CheckSquare, Notebook, MessageSquare, Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/lib/utils/menuItems'

const ICON_MAP: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  'map-pin': MapPin,
  'star': Star,
  'graduation-cap': GraduationCap,
  'clock': Clock,
  'calendar': Calendar,
  'newspaper': Newspaper,
  'file-text': FileText,
  'gift': Gift,
  'phone': Phone,
  'home': Home,
  'layout-dashboard': LayoutDashboard,
  'users': Users,
  'timer': Timer,
  'book-copy': BookCopy,
  'check-square': CheckSquare,
  'notebook': Notebook,
  'message-cog': MessageSquare,
  'settings': Settings,
}

// Downward-pointing filled triangle, same path as Nuxt's TreeView toggle-icon
function ToggleArrow({ open }: { open: boolean }) {
  return (
    <svg
      width={25}
      height={25}
      className={cn(
        'shrink-0 fill-[gray] transition-transform duration-200',
        open ? 'rotate-0' : '-rotate-90',
      )}
    >
      <path d="M7,10L12,15L17,10H7Z" />
    </svg>
  )
}

function NavItem({
  item,
  onNavigate,
  nested = false,
}: {
  item: MenuItem
  onNavigate?: () => void
  nested?: boolean
}) {
  // Top-level dropdowns start expanded (matches Nuxt tree-view :expanded="true",
  // whose onMounted sets expanded=true for top-level items only). Nested
  // dropdowns stay collapsed until clicked.
  const [open, setOpen] = useState(!nested)
  const hasChildren = (item.children?.length ?? 0) > 0
  const IconComp = item.icon ? ICON_MAP[item.icon] : null

  // .tree li { margin-left: 10px } and .tree li ul li { margin-left: 25px }
  const liClass = cn('list-none cursor-pointer', nested ? 'ml-[25px]' : 'ml-[10px]')
  // .node { display:flex; align-items:center; min-height:48px; padding:4px 0 }
  const nodeClass = 'flex items-center min-h-12 py-1 hover:bg-[#DCDCDC]'

  if (hasChildren) {
    return (
      <li className={liClass}>
        <div className={nodeClass} onClick={() => setOpen((o) => !o)}>
          <ToggleArrow open={open} />
          {IconComp && <IconComp size={20} color="gray" className="ml-5 shrink-0" />}
          {/* .clickable-dropdown { margin-left:10px } */}
          <p className="flex-1 m-0 pl-[10px] break-words whitespace-normal font-semibold">
            {item.name}
          </p>
        </div>
        {open && (
          <ul className="pl-0 m-0">
            {item.children!.map((child) => (
              <NavItem key={child.name} item={child} onNavigate={onNavigate} nested />
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (!item.url) return null

  const isExternal = item.external && item.url.startsWith('http')

  // Inner row: icon (ml-20px) + text (ml-20px for .direct-child)
  const inner = (
    <div className={nodeClass}>
      {IconComp ? (
        <IconComp size={20} color="gray" className="ml-5 shrink-0" />
      ) : (
        <Link2 size={20} color="gray" className="ml-5 shrink-0" />
      )}
      {/* .direct-child { margin-left:20px } */}
      <span className="ml-5 flex-1 break-words whitespace-normal font-semibold">
        {item.name}
      </span>
    </div>
  )

  const linkClass = 'block no-underline text-inherit'

  if (isExternal) {
    return (
      <li className={liClass}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className={linkClass} onClick={onNavigate}>
          {inner}
        </a>
      </li>
    )
  }

  return (
    <li className={liClass}>
      <Link href={item.url} className={linkClass} onClick={onNavigate}>
        {inner}
      </Link>
    </li>
  )
}

export function NavMenu({ items, onNavigate }: { items: MenuItem[]; onNavigate?: () => void }) {
  return (
    <nav
      aria-label="Main navigation menu"
      className="font-[family-name:var(--org-font-body,inherit)]"
    >
      <ul className="pl-0 m-0">
        {items.map((item) => (
          <NavItem key={item.name} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  )
}
