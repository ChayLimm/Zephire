import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { jobsApi } from '@/lib/api'
import { JobDescription } from '@/types'
import { addNotification } from './uiSlice'

interface JobsState {
  items: JobDescription[]
  selectedJob: JobDescription | null
  loading: boolean
  error: string | null
}

const initialState: JobsState = {
  items: [],
  selectedJob: null,
  loading: false,
  error: null,
}

export const fetchJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      const res = await jobsApi.getAll()
      return res.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch jobs'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const createJob = createAsyncThunk(
  'jobs/create',
  async (data: { title: string; field: string; position: string; required_skills: string[]; min_exp_years: number; description: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      const res = await jobsApi.match(data)
      dispatch(addNotification({ id: Date.now().toString(), type: 'success', message: 'Job created and candidates matched!' }))
      return res.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create job'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const removeJob = createAsyncThunk(
  'jobs/remove',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      await jobsApi.delete(id)
      dispatch(addNotification({ id: Date.now().toString(), type: 'success', message: 'Job deleted' }))
      return id
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete job'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload },
    setError: (state, action: PayloadAction<string>) => { state.error = action.payload },
    clearError: (state) => { state.error = null },
    setSelectedJob: (state, action: PayloadAction<JobDescription | null>) => { state.selectedJob = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.fulfilled, (state, action) => { state.items = action.payload || [] })
      .addCase(fetchJobs.rejected, (state, action) => { state.error = action.payload as string })
      .addCase(createJob.fulfilled, (state, action) => { state.items.unshift(action.payload) })
      .addCase(removeJob.fulfilled, (state, action) => {
        state.items = state.items.filter(j => j.id !== action.payload)
      })
  },
})

export const { setLoading, setError, clearError, setSelectedJob } = jobsSlice.actions

export const selectAllJobs = (state: any) => state.jobs.items
export const selectSelectedJob = (state: any) => state.jobs.selectedJob
export const selectJobsLoading = (state: any) => state.jobs.loading
export const selectJobsError = (state: any) => state.jobs.error

export default jobsSlice.reducer
