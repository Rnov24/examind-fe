import axios from 'axios'

const isDev = typeof window !== 'undefined' && window.location.port === '3000'
const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost'

export const api = axios.create({
  baseURL: isDev ? '/api/v1' : `http://${host}:8000/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('examind_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Session Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect loops if already on login page
      if (!window.location.hash.includes('/login') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('examind_token')
        localStorage.removeItem('examind_user')
        window.location.href = '/#/login?reason=session_expired'
      }
    }
    return Promise.reject(error)
  }
)

export default api
