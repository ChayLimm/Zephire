import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/lib/api'
import { addNotification } from './uiSlice'

interface AuthState {
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
}
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
            console.log('LOGIN PAYLOAD:', { email, password }) // ← add this

      const res = await authApi.login(email, password)
      console.log('LOGIN RESPONSE:', res.data) // ← add this

      // ✅ your backend returns directly, not wrapped in ApiResponse
      const token = res.data.access_token
      localStorage.setItem('access_token', token)

      if (!token) throw new Error('No token received')

      localStorage.setItem('access_token', token)
      dispatch(addNotification({ id: Date.now().toString(), type: 'success', message: 'Login successful!' }))
      return token
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, role }: { username: string; email: string; password: string; role: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      const res = await authApi.register(username, email, password, role)

      // ✅ same fix for register
      const token = res.data.access_token

      if (!token) throw new Error('No token received')
      
      localStorage.setItem('access_token', token)
      console.log("done setting accesstoke");
      dispatch(addNotification({ id: Date.now().toString(), type: 'success', message: 'Account created!' }))
      return token
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload },
    setToken: (state, action: PayloadAction<string>) => { state.token = action.payload },
    logout: (state) => {
      state.token = null
      localStorage.removeItem('access_token')
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => { state.token = action.payload })
      .addCase(login.rejected, (state, action) => { state.error = action.payload as string })
      .addCase(register.fulfilled, (state, action) => { state.token = action.payload })
      .addCase(register.rejected, (state, action) => { state.error = action.payload as string })
  },
})

export const { setLoading, setToken, logout, clearError } = authSlice.actions
export const selectToken = (state: any) => state.auth.token
export const selectAuthLoading = (state: any) => state.auth.loading
export const selectAuthError = (state: any) => state.auth.error
export default authSlice.reducer
