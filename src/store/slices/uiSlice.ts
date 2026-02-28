import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from '@/types'

type ModalType = 'addCandidate' | 'deleteCandidate' | 'viewCV' | 'addJob' | 'deleteJob' | null

interface UIState {
  sidebarOpen: boolean
  activeModal: ModalType
  modalPayload: any
  notifications: Notification[]
}

const initialState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  modalPayload: null,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload },
    openModal: (state, action: PayloadAction<{ type: ModalType; payload?: any }>) => {
      state.activeModal = action.payload.type
      state.modalPayload = action.payload.payload ?? null
    },
    closeModal: (state) => {
      state.activeModal = null
      state.modalPayload = null
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
  },
})

export const { toggleSidebar, setSidebarOpen, openModal, closeModal, addNotification, removeNotification } = uiSlice.actions

export const selectSidebarOpen = (state: any) => state.ui.sidebarOpen
export const selectActiveModal = (state: any) => state.ui.activeModal
export const selectModalPayload = (state: any) => state.ui.modalPayload
export const selectNotifications = (state: any) => state.ui.notifications

export default uiSlice.reducer
