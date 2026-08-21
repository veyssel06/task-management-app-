import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ✅ Normal kullanıcı instance
const api = axios.create({
  baseURL: BASE,
  timeout: 20000, // 20sn — cold start için yeterli
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ✅ Admin instance
export const adminApi = axios.create({
  baseURL: BASE,
  timeout: 20000,
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api