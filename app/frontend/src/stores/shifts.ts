import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface Shift {
    id: number;
    startTime: string;
    endTime: string | null;
    isActive: boolean;
}

export const useShiftsStore = defineStore('shifts', () => {
    const currentShift = ref<Shift | null>(null)
    const dailyHours = ref(0)
    const isLoading = ref(false)

    const fetchCurrentShift = async () => {
        isLoading.value = true
        try {
            const response = await api.get('/shifts/current')
            currentShift.value = response.data
            
            const hoursResponse = await api.get('/shifts/daily-hours')
            dailyHours.value = hoursResponse.data
        } catch (error) {
            console.error('Error fetching current shift or daily hours:', error)
        } finally {
            isLoading.value = false
        }
    }

    const startShift = async () => {
        isLoading.value = true
        try {
            const response = await api.post('/shifts/start')
            currentShift.value = response.data
            return true
        } catch (error) {
            console.error('Error starting shift:', error)
            return false
        } finally {
            isLoading.value = false
        }
    }

    const endShift = async () => {
        isLoading.value = true
        try {
            const response = await api.post('/shifts/end')
            currentShift.value = null
            
            // Refresh daily hours after ending shift
            const hoursResponse = await api.get('/shifts/daily-hours')
            dailyHours.value = hoursResponse.data
            
            return true
        } catch (error) {
            console.error('Error ending shift:', error)
            return false
        } finally {
            isLoading.value = false
        }
    }

    return {
        currentShift,
        dailyHours,
        isLoading,
        fetchCurrentShift,
        startShift,
        endShift
    }
})
