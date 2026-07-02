'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, MapPin, Star, GraduationCap, Clock,
  Calendar, Newspaper, FileText, Gift, Phone, Link2,
  type LucideIcon,
} from 'lucide-react'
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
}

// Downward-pointing filled triangle, same path as Nuxt's TreeView toggle-icon
function ToggleArrow({ open }: { open: boolean }) {
  return (
    <svg
      width={25}
      height={25}
      style={{
        flexShrink: 0,
        fill: 'gray',
        transform: open ? 'none' : 'rotate(-90deg)',
        transition: 'transform 0.2s',
      }}
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
  const [open, setOpen] = useState(false)
  const hasChildren = (item.children?.length ?? 0) > 0
  const IconComp = item.icon ? ICON_MAP[item.icon] : null

  // Matches .tree li { margin-left: 10px } and .tree li ul li { margin-left: 25px }
  const liStyle: React.CSSProperties = {
    listStyleType: 'none',
    cursor: 'pointer',
    marginLeft: nested ? 25 : 10,
  }

  // Matches .node { display:flex; align-items:center; min-height:48px; padding:4px 0 }
  const nodeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    minHeight: 48,
    padding: '4px 0',
  }

  if (hasChildren) {
    return (
      <li style={liStyle}>
        <div
          style={nodeStyle}
          className="hover:bg-[#DCDCDC]"
          onClick={() => setOpen((o) => !o)}
        >
          <ToggleArrow open={open} />
          {IconComp && (
            <IconComp
              size={20}
              color="gray"
              style={{ marginLeft: 20, flexShrink: 0 }}
            />
          )}
          {/* .clickable-dropdown { margin-left:10px } */}
          <p style={{ marginLeft: 10, flex: 1, wordWrap: 'break-word', whiteSpace: 'normal', margin: 0, paddingLeft: 10 }}>
            {item.name}
          </p>
        </div>
        {open && (
          <ul style={{ paddingLeft: 0, margin: 0 }}>
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
    <div style={nodeStyle} className="hover:bg-[#DCDCDC]">
      {IconComp ? (
        <IconComp
          size={20}
          color="gray"
          style={{ marginLeft: 20, flexShrink: 0 }}
        />
      ) : (
        <Link2 size={20} color="gray" style={{ marginLeft: 20, flexShrink: 0 }} />
      )}
      {/* .direct-child { margin-left:20px } */}
      <span style={{ marginLeft: 20, flex: 1, wordWrap: 'break-word', whiteSpace: 'normal' }}>
        {item.name}
      </span>
    </div>
  )

  const linkStyle: React.CSSProperties = { textDecoration: 'none', color: 'inherit', display: 'block' }

  if (isExternal) {
    return (
      <li style={liStyle}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" style={linkStyle} onClick={onNavigate}>
          {inner}
        </a>
      </li>
    )
  }

  return (
    <li style={liStyle}>
      <Link href={item.url} style={linkStyle} onClick={onNavigate}>
        {inner}
      </Link>
    </li>
  )
}

export function NavMenu({ items, onNavigate }: { items: MenuItem[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation menu">
      <ul style={{ paddingLeft: 0, margin: 0 }}>
        {items.map((item) => (
          <NavItem key={item.name} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  )
}
