import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface TableOrder {
    id?: number;
    tableNumber: string;
    cartData: any[];
    total: number;
    lastUpdated?: string;
}

export const useTablesStore = defineStore('tables', () => {
    const pendingOrders = ref<Record<string, any[]>>({})
    const tableLayout = ref<any[]>([])
    const isLoading = ref(false)

    const fetchPendingOrders = async () => {
        isLoading.value = true
        try {
            const response = await api.get('/tables')
            const orders: Record<string, any[]> = {}
            response.data.forEach((order: any) => {
                if (order.tableNumber === 'LAYOUT_CONFIG') {
                    tableLayout.value = JSON.parse(order.cartData)
                } else {
                    orders[order.tableNumber] = JSON.parse(order.cartData)
                }
            })
            pendingOrders.value = orders
        } catch (error) {
            console.error('Error fetching pending orders:', error)
        } finally {
            isLoading.value = false
        }
    }

    const saveTableOrder = async (tableNumber: string, cartData: any[], total: number) => {
        try {
            await api.post('/tables', { tableNumber, cartData, total })
            if (tableNumber !== 'LAYOUT_CONFIG') {
                pendingOrders.value[tableNumber] = [...cartData]
            }
        } catch (error) {
            console.error('Error saving table order:', error)
        }
    }

    const saveTableLayout = async (layout: any[]) => {
        tableLayout.value = layout
        await saveTableOrder('LAYOUT_CONFIG', layout, 0)
    }

    const clearTableOrder = async (tableNumber: string) => {
        try {
            await api.delete(`/tables/${tableNumber}`)
            delete pendingOrders.value[tableNumber]
        } catch (error) {
            console.error('Error deleting table order:', error)
        }
    }

    return {
        pendingOrders,
        tableLayout,
        isLoading,
        fetchPendingOrders,
        saveTableOrder,
        saveTableLayout,
        clearTableOrder
    }
})
