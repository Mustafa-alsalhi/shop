import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  loading: false,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showSuccessNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'success',
        message: action.payload,
        timestamp: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
    },
    showErrorNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'error',
        message: action.payload,
        timestamp: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
  },
})

export const { showSuccessNotification, showErrorNotification, clearNotifications, removeNotification } = notificationsSlice.actions

export default notificationsSlice.reducer
