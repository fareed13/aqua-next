'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from './useAuth'
import { buildMenuItems, type MenuItem } from '@/lib/utils/menuItems'

interface UseHeaderProps {
  previewColors?: Record<string, string> | null
  previewFonts?: Record<string, string> | null
  isPreview?: boolean
}

export function useHeader(props: UseHeaderProps = {}) {
  const { previewColors = null, previewFonts = null, isPreview = false } = props

  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const locations = useOrgStore(s => s.locations)
  const setDialog = useUiStore(s => s.setDialog)

  const { isLoggedIn, isAdminLoggedIn, isSuperAdminLoggedIn, getUser } = useAuth()

  const [ready, setReady] = useState(false)
  const [drawer, setDrawer] = useState(false)

  const defaultMenu = useMemo((): MenuItem[] => {
    if (!organization || !location) return []
    return buildMenuItems(organization, location, locations ?? [])
  }, [organization, location, locations])

  const loggedInMenu = useMemo((): MenuItem[] => {
    if (!organization || !location) return []
    return buildMenuItems(organization, location, locations ?? [], true)
  }, [organization, location, locations])

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [adminMenu, setAdminMenu] = useState<MenuItem[]>([])

  const preventClickIfMaintenance = useMemo(() => {
    return !!organization?.under_maintenance && !isAdminLoggedIn()
  }, [organization, isAdminLoggedIn])

  const logo = useMemo(() => {
    if (!organization?.primary_logo?.uuid) return ''
    const l = organization.primary_logo
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
    return `${mediaUrl}/${l.uuid}_350.${l.extension}`
  }, [organization])

  const colors = useMemo(() => {
    return previewColors || organization?.colors || {}
  }, [previewColors, organization])

  const fonts = useMemo(() => {
    return previewFonts || organization?.fonts || {}
  }, [previewFonts, organization])

  const showAdminElements = useMemo(() => {
    return !isPreview && isAdminLoggedIn()
  }, [isPreview, isAdminLoggedIn])

  const fontStyles = useMemo(() => {
    const styles: Record<string, string> = {}
    if (fonts.body) styles['--font-body'] = fonts.body
    if (fonts.h1) styles['--font-h1'] = fonts.h1
    if (fonts.h2) styles['--font-h2'] = fonts.h2
    if (fonts.h3) styles['--font-h3'] = fonts.h3
    if (fonts.h4) styles['--font-h4'] = fonts.h4
    if (fonts.h5) styles['--font-h5'] = fonts.h5
    if (fonts.h6) styles['--font-h6'] = fonts.h6
    if (fonts.p) styles['--font-p'] = fonts.p
    return styles
  }, [fonts])

  const handleStepperClick = useCallback(() => {
    if (preventClickIfMaintenance) return
    setDrawer(false)
    if (!isLoggedIn()) {
      setDialog(true)
    }
  }, [preventClickIfMaintenance, isLoggedIn, setDialog])

  const close = useCallback(() => {
    setDialog(false)
  }, [setDialog])

  useEffect(() => {
    const loggedIn = isLoggedIn()
    setMenuItems(loggedIn ? loggedInMenu : defaultMenu)
    setReady(true)
  }, [defaultMenu, loggedInMenu, isLoggedIn])

  return {
    organization,
    location,
    locations,
    ready,
    drawer,
    setDrawer,
    menuItems,
    adminMenu,
    preventClickIfMaintenance,
    logo,
    colors,
    fonts,
    showAdminElements,
    fontStyles,
    handleStepperClick,
    close,
    setDialog,
  }
}
