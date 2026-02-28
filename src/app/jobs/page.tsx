'use client'
import { useEffect, useState } from 'react'
import { Plus, Briefcase, Trash2, ChevronRight, X, Loader2, Target, Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchJobs, createJob, removeJob, selectAllJobs, selectJobsLoading, selectJobsError, clearError, setSelectedJob } from '@/store/slices/jobsSlice'
import { openModal, closeModal, selectActiveModal, selectModalPayload } from '@/store/slices/uiSlice'
import { SkeletonList } from '@/components/ui/Skeleton'
import { DomainBadge } from '@/components/ui/Badge'
import { JobDescription } from '@/types'
import { useRouter } from 'next/navigation'
import JobFormModal from '@/components/jobs/JobModal'

export default function JobsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const jobs = useAppSelector(selectAllJobs)
  const loading = useAppSelector(selectJobsLoading)
  const error = useAppSelector(selectJobsError)
  const activeModal = useAppSelector(selectActiveModal)
  const modalPayload = useAppSelector(selectModalPayload)

  useEffect(() => { dispatch(fetchJobs()) }, [dispatch])

  const handleDelete = async (id: number) => {
    await dispatch(removeJob(id))
    dispatch(closeModal())
  }

  const handleView = (job: JobDescription) => {
    dispatch(setSelectedJob(job))
    router.push(`/jobs/${job.id}`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F1729' }}>Job Descriptions</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A99' }}>Create jobs and find matching candidates</p>
        </div>
        <button onClick={() => dispatch(openModal({ type: 'addJob' }))} className="btn-primary">
          <Plus size={16} /> Create Job
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#DC2626' }}>
          <X size={16} />
          <p className="flex-1 text-sm">{error}</p>
          <button onClick={() => dispatch(clearError())}><X size={14} /></button>
        </div>
      )}

      {loading && jobs.length === 0 ? (
        <SkeletonList count={4} />
      ) : jobs.length === 0 ? (
        <div className="card p-16 text-center">
          <Briefcase size={40} className="mx-auto mb-4" style={{ color: '#D1D9E6' }} />
          <p style={{ color: '#9BAABF' }}>No jobs yet. Create one to start matching candidates.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job: JobDescription) => (
            <div key={job.id} className="card p-5 cursor-pointer" onClick={() => handleView(job)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: '#0F1729' }}>{job.title}</h3>
                  <div className="flex items-center gap-2">
                    {job.field && <DomainBadge domain={job.field} />}
                    <span className="text-xs" style={{ color: '#9BAABF' }}>{job.minExpYears}+ yrs</span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); dispatch(openModal({ type: 'deleteJob', payload: job })) }}
                  className="p-1.5 rounded-lg transition-all ml-2"
                  style={{ color: '#9BAABF' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9BAABF'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="text-xs line-clamp-2 mb-4" style={{ color: '#6B7A99' }}>{job.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users size={13} style={{ color: '#9BAABF' }} />
                  <span className="text-xs" style={{ color: '#9BAABF' }}>
                    {job.matchResults?.length || 0} matches
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: '#1e6ddb' }}>
                  <Target size={13} />
                  View Results
                  <ChevronRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeModal === 'addJob' && (
        <JobFormModal onClose={() => dispatch(closeModal())} />
      )}

      {activeModal === 'deleteJob' && modalPayload && (
        <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0F1729' }}>Delete Job</h3>
            <p className="text-sm mb-6" style={{ color: '#6B7A99' }}>
              Remove <span className="font-medium" style={{ color: '#0F1729' }}>{modalPayload.title}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => dispatch(closeModal())}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(modalPayload.id)} disabled={loading}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
