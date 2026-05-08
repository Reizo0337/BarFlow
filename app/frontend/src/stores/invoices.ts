import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface Invoice {
    id: number;
    invoiceNumber: string;
    type: 'in' | 'out';
    clientName: string;
    amount: number;
    status: 'paid' | 'pending' | 'cancelled';
    createdAt: string;
}

export const useInvoicesStore = defineStore('invoices', () => {
    const invoices = ref<Invoice[]>([])
    const isLoading = ref(false)

    const fetchInvoices = async () => {
        isLoading.value = true
        try {
            const response = await api.get('/invoices')
            invoices.value = response.data
        } catch (error) {
            console.error('Error fetching invoices:', error)
        } finally {
            isLoading.value = false
        }
    }

    const todayInvoices = computed(() => {
        const today = new Date().toISOString().split('T')[0]
        return invoices.value.filter(inv => inv.createdAt.startsWith(today))
    })

    const todayRevenue = computed(() => {
        return todayInvoices.value
            .filter(inv => inv.type === 'out' && inv.status === 'paid')
            .reduce((sum, inv) => sum + Number(inv.amount), 0)
    })

    const todaySalesCount = computed(() => {
        return todayInvoices.value.filter(inv => inv.type === 'out').length
    })

    return {
        invoices,
        isLoading,
        fetchInvoices,
        todayInvoices,
        todayRevenue,
        todaySalesCount
    }
})
