import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    minStock: number;
    unit: string;
}

export const useInventoryStore = defineStore('inventory', () => {
    const products = ref<Product[]>([])
    const isLoading = ref(false)

    const fetchProducts = async () => {
        isLoading.value = true
        try {
            const response = await api.get('/inventory')
            products.value = response.data
        } catch (error) {
            console.error('Error fetching inventory:', error)
        } finally {
            isLoading.value = false
        }
    }

    const updateStock = async (id: number, newStock: number) => {
        try {
            await api.patch(`/inventory/${id}`, { stock: newStock })
            await fetchProducts()
        } catch (error) {
            console.error('Error updating stock:', error)
        }
    }

    return {
        products,
        isLoading,
        fetchProducts,
        updateStock
    }
})
