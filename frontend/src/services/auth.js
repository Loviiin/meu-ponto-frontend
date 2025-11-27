import api from '../axios'

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('access', response.data.token)
    }
    return response.data
}

export const requestPasswordReset = async (email) => {
    return await api.post('/auth/forgot-password', { email })
}

export const resetPassword = async (token, newPassword) => {
    return await api.post('/auth/reset-password', { token, new_password: newPassword })
}

export const validateResetToken = async (token) => {
    return await api.get(`/auth/validate-reset-token?token=${token}`)
}

export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('access')
    localStorage.removeItem('user')
    window.location.href = '/login'
}

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
}
