import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  notifications: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications')
      return response.data.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/notifications/${id}/read`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read')
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification')
    }
  }
)

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async ({ type, title, message, data, link }, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const user = state.auth.user
      
      if (!user) {
        // If user is not authenticated, just return a local notification
        return {
          id: Date.now(),
          type: type || 'info',
          title: title || 'Notification',
          message: message || '',
          data: data || null,
          link: link || null,
          read: false,
          timestamp: new Date().toISOString(),
        }
      }
      
      const response = await api.post('/notifications', {
        user_id: user.id,
        type: type || 'info',
        title: title || 'Notification',
        message: message || '',
        data: data || null,
        link: link || null,
      })
      
      return response.data.data
    } catch (error) {
      // If API fails, return a local notification as fallback
      return {
        id: Date.now(),
        type: type || 'info',
        title: title || 'Notification',
        message: message || '',
        data: data || null,
        link: link || null,
        read: false,
        timestamp: new Date().toISOString(),
      }
    }
  }
)

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
        read: false,
      }
      state.notifications.unshift(notification)
    },
    showErrorNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'error',
        message: action.payload,
        timestamp: new Date().toISOString(),
        read: false,
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
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
        state.error = null
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload)
        if (notification) {
          notification.read = true
          notification.read_at = new Date().toISOString()
        }
      })
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true
          notification.read_at = new Date().toISOString()
        })
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          notification => notification.id !== action.payload
        )
      })
      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload)
      })
  },
})

export const { showSuccessNotification, showErrorNotification, clearNotifications, removeNotification } = notificationsSlice.actions

// Selectors
export const selectNotifications = (state) => state.notifications.notifications
export const selectNotificationsLoading = (state) => state.notifications.loading
export const selectNotificationsError = (state) => state.notifications.error

export default notificationsSlice.reducer
