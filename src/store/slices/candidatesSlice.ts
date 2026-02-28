import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { candidatesApi } from '@/lib/api'
import { Candidate } from '@/types'
import { addNotification } from './uiSlice'

interface CandidatesState {
  items: Candidate[]
  selectedCandidate: Candidate | null
  loading: boolean
  error: string | null
  filters: { domain: string; search: string }
}

const initialState: CandidatesState = {
  items: [],
  selectedCandidate: null,
  loading: false,
  error: null,
  filters: { domain: '', search: '' },
}

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      const res = await candidatesApi.getAll()
      return res.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch candidates'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const uploadCandidate = createAsyncThunk(
  'candidates/upload',
  async ({ file, domain, email }: { file: File; domain: string, email: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      const res = await candidatesApi.upload(file, domain, email)
      dispatch(addNotification({ id: Date.now().toString(), type: 'success', message: 'CV uploaded and processed!' }))
      return res.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload CV'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const updateCandidate = createAsyncThunk(
  'candidates/update',
  async(data:{ id: number; domain: string; email: string; expYears: number; name: string; phone: string; position: string; },{dispatch, rejectWithValue})=>{
    try{
      dispatch(setLoading(true))
      const res = await candidatesApi.update(data)
      return res.data.data
    }catch(err:any){
      const msg = err.response?.data?.message || 'Failed to update candidate'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
    }finally {
      dispatch(setLoading(false))
    }
  }
)

export const removeCandidate = createAsyncThunk(
  'candidates/remove',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      await candidatesApi.delete(id)
      dispatch(addNotification({ id: Date.now().toString(), type: 'success', message: 'Candidate removed' }))
      return id
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete candidate'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload },
    setError: (state, action: PayloadAction<string>) => { state.error = action.payload },
    clearError: (state) => { state.error = null },
    setSelectedCandidate: (state, action: PayloadAction<Candidate | null>) => { state.selectedCandidate = action.payload },
    setFilters: (state, action: PayloadAction<Partial<{ domain: string; search: string }>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    addCandidate: (state, action: PayloadAction<Candidate>) => { state.items.unshift(action.payload) },
    deleteCandidate: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(c => c.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.fulfilled, (state, action) => { state.items = action.payload || [] })
      .addCase(fetchCandidates.rejected, (state, action) => { state.error = action.payload as string })
      .addCase(uploadCandidate.fulfilled, (state, action) => { state.items.unshift(action.payload) })
      .addCase(removeCandidate.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload)
      })
  },
})

export const { setLoading, setError, clearError, setSelectedCandidate, setFilters, addCandidate, deleteCandidate } = candidatesSlice.actions

export const selectAllCandidates = (state: any) => state.candidates.items
export const selectFilteredCandidates = (state: any) => {
  const { items, filters } = state.candidates
  return items.filter((c: Candidate) => {
    const matchDomain = !filters.domain || c.domain === filters.domain
    const matchSearch = !filters.search ||
      c.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.position?.toLowerCase().includes(filters.search.toLowerCase())
    return matchDomain && matchSearch
  })
}
export const selectSelectedCandidate = (state: any) => state.candidates.selectedCandidate
export const selectCandidatesLoading = (state: any) => state.candidates.loading
export const selectCandidatesError = (state: any) => state.candidates.error
export const selectCandidatesFilters = (state: any) => state.candidates.filters

export default candidatesSlice.reducer
