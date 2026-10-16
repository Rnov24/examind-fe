import axios from 'axios'

const isBrowser = typeof window !== 'undefined'
const defaultBaseUrl = isBrowser ? '/api/v1' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1')

export const api = axios.create({
  baseURL: defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = localStorage.getItem('examind_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Session Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && isBrowser) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('examind_token')
        localStorage.removeItem('examind_user')
        window.location.href = '/login?reason=session_expired'
      }
    }
    return Promise.reject(error)
  }
)

export default api
