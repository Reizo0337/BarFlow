import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface User {
    id: number;
    name: string;
    role: string;
    avatar: string;
    pin?: string;
}

export const useAuthStore = defineStore('auth', () => {
    const getSavedUser = () => {
        try {
            const saved = localStorage.getItem('user')
            return saved ? JSON.parse(saved) : null
        } catch (e) {
            return null
        }
    }

    const user = ref<User | null>(getSavedUser())
    const token = ref<string | null>(localStorage.getItem('token'))
    const companyCode = ref<string | null>(localStorage.getItem('companyCode'))
    const employees = ref<User[]>([])
    const isLoading = ref(false)

    const fetchEmployees = async () => {
        if (!token.value) return
        isLoading.value = true
        try {
            const response = await api.get('/users')
            employees.value = response.data
        } catch (error) {
            console.error('Error fetching employees:', error)
            if (error.response?.status === 401) logout()
        } finally {
            isLoading.value = false
        }
    }

    const getProfile = async () => {
        if (!token.value) return
        try {
            // Assuming the backend has a /auth/profile or similar
            // If not, we can use /users/me or just rely on what we have
            // For now, let's assume we fetch all users and find ourselves? 
            // Better: just fetch employees, it's already doing that.
            await fetchEmployees()
        } catch (error) {
            console.error('Error getting profile:', error)
        }
    }

    const loginSaaS = async (code: string, pin: string) => {
        isLoading.value = true
        try {
            const response = await api.post(`/auth/login-saas`, {
                companyCode: code,
                pin
            })

            if (response.data && response.data.access_token) {
                user.value = response.data.user
                token.value = response.data.access_token
                companyCode.value = code

                localStorage.setItem('token', response.data.access_token)
                localStorage.setItem('companyCode', code)
                localStorage.setItem('user', JSON.stringify(response.data.user))

                await fetchEmployees()
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const switchUser = async (employeeId: number) => {
        const found = employees.value.find(e => e.id === employeeId)
        if (found) {
            user.value = found
            localStorage.setItem('user', JSON.stringify(found))
        }
    }

    const logout = () => {
        user.value = null
        token.value = null
        companyCode.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('companyCode')
        localStorage.removeItem('user')
        console.log('User logged out')
    }

    return {
        user,
        token,
        companyCode,
        employees,
        isLoading,
        fetchEmployees,
        loginSaaS,
        switchUser,
        logout
    }
})
