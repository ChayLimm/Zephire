'use client'
import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { removeNotification, selectNotifications } from '@/store/slices/uiSlice'
import { Notification } from '@/types'

const icons = {
  success: <CheckCircle size={16} className="text-teal-400" style={{ color: '#00D4AA' }} />,
  error: <XCircle size={16} className="text-red-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  info: <Info size={16} className="text-blue-400" />,
}

const borders = {
  success: '#00D4AA',
  error: '#F87171',
  warning: '#F59E0B',
  info: '#60A5FA',
}

function Toast({ notification }: { notification: Notification }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeNotification(notification.id))
    }, notification.duration || 4000)
    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, dispatch])

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl glass animate-slide-right"
      style={{
        borderLeft: `3px solid ${borders[notification.type]}`,
        minWidth: 280,
        maxWidth: 360,
      }}
    >
      <span className="mt-0.5">{icons[notification.type]}</span>
      <p className="flex-1 text-sm text-slate-200">{notification.message}</p>
      <button
        onClick={() => dispatch(removeNotification(notification.id))}
        className="text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const notifications = useAppSelector(selectNotifications)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {notifications.map(n => (
        <Toast key={n.id} notification={n} />
      ))}
    </div>
  )
}
