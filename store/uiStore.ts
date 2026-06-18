import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  dialog: boolean
  reviewDialog: boolean
  banner: boolean
  sidebar: boolean
  pageEditPopup: boolean
  serviceEditPopup: boolean
  locationEditPopup: boolean
  settingsVisibleSection: string | null
  scheduleBookNowClicked: boolean

  setDialog: (open: boolean, bookNowClick?: boolean) => void
  setReviewDialog: (open: boolean) => void
  setBanner: (show: boolean) => void
  setSidebar: (open: boolean) => void
  setPageEditPopup: (open: boolean) => void
  setServiceEditPopup: (open: boolean) => void
  setLocationEditPopup: (open: boolean) => void
  setSettingsVisibleSection: (section: string | null) => void
}

export const useUiStore = create<UIState>()(
  immer((set) => ({
    dialog: false,
    reviewDialog: false,
    banner: true,
    sidebar: false,
    pageEditPopup: false,
    serviceEditPopup: false,
    locationEditPopup: false,
    settingsVisibleSection: null,
    scheduleBookNowClicked: false,

    setDialog: (open, bookNowClick = false) => set((state) => {
      state.dialog = open
      state.scheduleBookNowClicked = bookNowClick
    }),
    setReviewDialog: (open) => set((state) => { state.reviewDialog = open }),
    setBanner: (show) => set((state) => { state.banner = show }),
    setSidebar: (open) => set((state) => { state.sidebar = open }),
    setPageEditPopup: (open) => set((state) => { state.pageEditPopup = open }),
    setServiceEditPopup: (open) => set((state) => { state.serviceEditPopup = open }),
    setLocationEditPopup: (open) => set((state) => { state.locationEditPopup = open }),
    setSettingsVisibleSection: (section) => set((state) => { state.settingsVisibleSection = section }),
  }))
)

// Alias — both casings resolve to the same store
export const useUIStore = useUiStore
