import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface CheckoutCustomer {
  email: string
  phone: string
  firstName: string
  lastName: string
}

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
  selectedPlan: Record<string, unknown> | null
  interestedServiceId: number | null
  selectedEvent: Record<string, unknown> | null
  checkoutAuthToken: string
  checkoutCustomer: CheckoutCustomer | null

  setDialog: (open: boolean, bookNowClick?: boolean) => void
  setReviewDialog: (open: boolean) => void
  setBanner: (show: boolean) => void
  setSidebar: (open: boolean) => void
  setPageEditPopup: (open: boolean) => void
  setServiceEditPopup: (open: boolean) => void
  setLocationEditPopup: (open: boolean) => void
  setSettingsVisibleSection: (section: string | null) => void
  setSelectedPlan: (plan: Record<string, unknown> | null) => void
  setInterestedServiceId: (id: number | null) => void
  setSelectedEvent: (event: Record<string, unknown> | null) => void
  setCheckoutAuthToken: (token: string) => void
  setCheckoutCustomer: (customer: CheckoutCustomer) => void
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
    selectedPlan: null,
    interestedServiceId: null,
    selectedEvent: null,
    checkoutAuthToken: '',
    checkoutCustomer: null,

    setDialog: (open, bookNowClick = false) => set((state) => {
      state.dialog = open
      state.scheduleBookNowClicked = bookNowClick
      if (!open) {
        state.checkoutAuthToken = ''
        state.checkoutCustomer = null
      }
    }),
    setReviewDialog: (open) => set((state) => { state.reviewDialog = open }),
    setBanner: (show) => set((state) => { state.banner = show }),
    setSidebar: (open) => set((state) => { state.sidebar = open }),
    setPageEditPopup: (open) => set((state) => { state.pageEditPopup = open }),
    setServiceEditPopup: (open) => set((state) => { state.serviceEditPopup = open }),
    setLocationEditPopup: (open) => set((state) => { state.locationEditPopup = open }),
    setSettingsVisibleSection: (section) => set((state) => { state.settingsVisibleSection = section }),
    setSelectedPlan: (plan) => set((state) => { state.selectedPlan = plan }),
    setInterestedServiceId: (id) => set((state) => { state.interestedServiceId = id }),
    setSelectedEvent: (event) => set((state) => { state.selectedEvent = event }),
    setCheckoutAuthToken: (token) => set((state) => { state.checkoutAuthToken = token }),
    setCheckoutCustomer: (customer) => set((state) => { state.checkoutCustomer = customer }),
  }))
)

// Alias — both casings resolve to the same store
export const useUIStore = useUiStore
