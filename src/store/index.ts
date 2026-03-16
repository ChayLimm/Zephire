import { configureStore } from '@reduxjs/toolkit'
import candidatesReducer from './slices/candidatesSlice'
import jobsReducer from './slices/jobsSlice'
import chatReducer from './slices/chatSlice'
import uiReducer from './slices/uiSlice'
import authReducer from './slices/authSlice'
import emailReducer from './slices/emailSlice'

export const store = configureStore({
  reducer: {
    candidates: candidatesReducer,
    jobs: jobsReducer,
    chat: chatReducer,
    ui: uiReducer,
    auth: authReducer,
    email: emailReducer, 
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
