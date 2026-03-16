// store/slices/emailSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { emailApi } from '@/lib/api'
import { Email } from '@/types'

// ─── Types ───────────────────────────────────────────
interface EmailPayload {
  candidateId: number
  email: string
  subject: string
  body: string
  type: string
  meetingDate?: string
  meetingTime?: string
  meetingLocation?: string
}

interface EmailState {
  emails: Email[]
  loading: boolean
  success: boolean
  error: string | null
}


// ─── Initial State ───────────────────────────────────
const initialState: EmailState = {
    emails: [],
  loading: false,
  success: false,
  error: null,
}

// ─── Thunks ──────────────────────────────────────────
export const sendBulkEmails = createAsyncThunk(
  'email/sendBulk',
  async (emails: EmailPayload[], { rejectWithValue }) => {
    try {
      const res = await emailApi.sendBulk({ emails })
      return res.data
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to send emails'
      )
    }
  }
)

// ─── Slice ───────────────────────────────────────────
const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    resetEmail: (state) => {
      state.loading = false
      state.success = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendBulkEmails.pending, (state) => {
        state.loading = true
        state.success = false
        state.error = null
      })
      .addCase(sendBulkEmails.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(sendBulkEmails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false
        state.emails = action.payload
    })
    .addCase(updateEmailStatus.fulfilled, (state, action) => {
        const updated = action.payload
        state.emails = state.emails.map(e => e.id === updated.id ? updated : e)
    })

  },
})

export const fetchEmails = createAsyncThunk(
  'email/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await emailApi.getAll()
      return res.data?.data || res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch emails')
    }
  }
)

export const updateEmailStatus = createAsyncThunk(
  'email/updateStatus',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      const res = await emailApi.updateStatus(id, status)
      return res.data?.data || res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update status')
    }
  }
)


// ─── Exports ─────────────────────────────────────────
export const { resetEmail } = emailSlice.actions
export const selectEmailLoading = (state: any) => state.email.loading
export const selectEmailSuccess = (state: any) => state.email.success
export const selectEmailError = (state: any) => state.email.error
export const selectEmails = (state: any) => state.email.emails

export default emailSlice.reducer