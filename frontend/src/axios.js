import axios from 'axios'

const api = axios.create({

  baseURL: 'https://silver-doodle-rr6x77p5wg42557-8083.app.github.dev/api/v1',
  //http://localhost:8000 - Django api
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