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
        const todayStr = new Date().toISOString().split('T')[0]

        return invoices.value.filter(inv => {
            if (!inv.createdAt) return false
            // Compare only the YYYY-MM-DD part
            const invDateStr = new Date(inv.createdAt).toISOString().split('T')[0]
            return invDateStr === todayStr
        })
    })

    const todayRevenue = computed(() => {
        return todayInvoices.value
            .filter(inv => {
                const type = (inv as any).type?.toLowerCase()
                // Backend uses fiscalStatus: 'normal' for valid invoices
                const status = (inv as any).fiscalStatus || (inv as any).status
                return (type === 'sale' || type === 'out' || type === 'purchase') && (status === 'paid' || status === 'normal')
            })
            .reduce((sum, inv) => sum + Number(inv.amount), 0)
    })

    const todaySalesCount = computed(() => {
        return todayInvoices.value.filter(inv => {
            const type = (inv as any).type?.toLowerCase()
            return type === 'sale' || type === 'out' || type === 'purchase'
        }).length
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
