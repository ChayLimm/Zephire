import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (username: string, email: string, password: string, role: string) =>
    api.post('/api/auth/register', { username, email, password, role }),
}

// ─── Candidates ──────────────────────────────────────
export const candidatesApi = {
  getAll: () => api.get('/api/candidates'),
  getById: (id: number) => api.get(`/api/candidates/${id}`),

  getPending: () => api.get('/api/candidates/pending'),
  approve: (id: number) => api.put(`/api/candidates/${id}/approve`),
  reject: (id: number) => api.put(`/api/candidates/${id}/reject`),

  upload: (file: File, domain: string, email: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('domain', domain)
    form.append('email', email)
    return api.post('/api/candidates/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  update: (data: {
    id: number
    domain: string
    email: string
    exp_years: number
    name: string
    phone: string
    position: string
  }) => api.patch(`/api/candidates/${data.id}`, data), // ✅ fixed typo: candidaites → candidates

  delete: (id: number) => api.delete(`/api/candidates/${id}`),
  previewUrl: (id: number) => `${API_BASE}/api/candidates/${id}/preview`,

  // ─── Public (no auth) ───────────────────
  apply: (file: File, data: {
    name: string
    email: string
    phone: string
    domain: string
    position: string
    exp_years: number
  }) => {
    const form = new FormData()
    form.append('file', file)
    form.append('name', data.name)
    form.append('email', data.email)
    form.append('phone', data.phone)
    form.append('domain', data.domain)
    form.append('position', data.position)
    form.append('exp_years', String(data.exp_years))
    return api.post('/api/public/apply', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ─── Job Descriptions ─────────────────────────────────
export const jobsApi = {
  getAll: () => api.get('/api/jd'),
  getById: (id: number) => api.get(`/api/jd/${id}`),
  match: (data: {
    title: string
    field: string
    position: string
    required_skills: string[]
    min_exp_years: number
    description: string
  }) => api.post('/api/jd/match', data),
  delete: (id: number) => api.delete(`/api/jd/${id}`),
}

// ─── Chat ─────────────────────────────────────────────
export const chatApi = {
  send: (message: string, jdId?: number) =>
    api.post('/api/chat', { message, jd_id: jdId ?? null }),
  getHistory: () => api.get('/api/chat/history'),
  getJobHistory: (jdId: number) => api.get(`/api/chat/history/${jdId}`),
  getCandidateHistory: (candidateId: number) => api.get(`/api/chat/history/candidate/${candidateId}`), // ← add
  sendCandidate: (message: string, candidateId: number) =>                                             // ← add
    api.post('/api/chat', { message, candidate_id: candidateId }),
  clearHistory: () => api.delete('/api/chat/history'),
}