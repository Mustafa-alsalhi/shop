import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/settings')
      console.log('Settings fetched:', response.data)
      console.log('WhatsApp URL from settings:', response.data?.whatsapp_url)
      return response.data
    } catch (error) {
      console.error('Error fetching settings:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

const initialState = {
  data: null,
  loading: false,
  error: null
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.error = null
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// Selectors
export const selectSettings = (state) => state.settings.data
export const selectSettingsLoading = (state) => state.settings.loading
export const selectSettingsError = (state) => state.settings.error
export const selectWhatsAppUrl = (state) => state.settings.data?.whatsapp_url || null

export default settingsSlice.reducer
export const { clearError } = settingsSlice.actions
