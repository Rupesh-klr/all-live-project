import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach Bearer token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — attempt token refresh, then redirect to login
let refreshing = false
let queue = []

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      refreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${BASE_URL}/api/auth/v1/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefresh } = data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefresh)

        queue.forEach(p => p.resolve(accessToken))
        queue = []

        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (_e) {
        queue.forEach(p => p.reject(_e))
        queue = []
        localStorage.clear()
        window.location.href = '/login'
      } finally {
        refreshing = false
      }
    }

    const message = err.response?.data?.message || err.message || 'Request failed'
    toast.error(message)
    return Promise.reject(err)
  }
)

export default api
