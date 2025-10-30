import axios from 'axios'
import ProfileService from './services/ProfileService'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000, // 60 segundos para lidar com cold start do servidor
});

// Adiciona o token JWT em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de resposta para tratar erros 401 (não autenticado)
api.interceptors.response.use(
  response => response,
  error => {
    // Se receber 401, limpa o cache do ProfileService
    if (error.response && error.response.status === 401) {
      console.log('🔒 Token expirado ou inválido - Limpando cache')
      ProfileService.clearCache()
    }
    return Promise.reject(error)
  }
)

export default api