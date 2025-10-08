import axios from 'axios'

const api = axios.create({


  baseUR2L: 'https://ponto-api-go-service-666877171588.southamerica-east1.run.app/api/v1',
  //http://localhost:8083 - Django api
  baseURL: 'https://silver-doodle-rr6x77p5wg42557-8083.app.github.dev/api/v1',
})

// Adiciona o token JWT em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api