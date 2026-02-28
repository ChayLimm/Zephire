import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { chatApi } from '@/lib/api'
import { ChatMessage } from '@/types'
import { addNotification } from './uiSlice'

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  error: string | null
}

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  error: null,
}

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await chatApi.getHistory()
      return res.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load history')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, jdId }: { message: string; jdId?: number }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setTyping(true))
      const res = await chatApi.send(message, jdId)
      return res.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send message'
      dispatch(addNotification({ id: Date.now().toString(), type: 'error', message: msg }))
      return rejectWithValue(msg)
    } finally {
      dispatch(setTyping(false))
    }
  }
)

export const clearHistory = createAsyncThunk(
  'chat/clearHistory',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await chatApi.clearHistory()
      dispatch(addNotification({ id: Date.now().toString(), type: 'success', message: 'Chat history cleared' }))
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear history')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setTyping: (state, action: PayloadAction<boolean>) => { state.isTyping = action.payload },
    setChatError: (state, action: PayloadAction<string>) => { state.error = action.payload },
    clearChatError: (state) => { state.error = null },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: Date.now(),
        role: 'HR',
        message: action.payload,
        createdAt: new Date().toISOString(),
      })
    },
    clearMessages: (state) => { state.messages = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.messages = action.payload || []
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (action.payload) state.messages.push(action.payload)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(clearHistory.fulfilled, (state) => {
        state.messages = []
      })
  },
})

export const { setTyping, setChatError, clearChatError, addUserMessage, clearMessages } = chatSlice.actions

export const selectMessages = (state: any) => state.chat.messages
export const selectIsTyping = (state: any) => state.chat.isTyping
export const selectChatError = (state: any) => state.chat.error

export default chatSlice.reducer
