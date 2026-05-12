import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    category: Category;
    price: number;
    stock: number;
    minStock: number;
    unit: string;
    image?: string;
}

export const useInventoryStore = defineStore('inventory', () => {
    const products = ref<Product[]>([])
    const categories = ref<Category[]>([])
    const isLoading = ref(false)

    const fetchProducts = async () => {
        isLoading.value = true
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/inventory/categories')
            ])
            
            products.value = prodRes.data
            categories.value = catRes.data
        } catch (error) {
            console.error('Error fetching inventory or categories:', error)
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

    const addProduct = async (data: any) => {
        try {
            await api.post('/inventory', data)
            await fetchProducts()
        } catch (error) {
            console.error('Error adding product:', error)
        }
    }

    const updateProduct = async (id: number, data: any) => {
        try {
            await api.patch(`/inventory/${id}`, data)
            await fetchProducts()
        } catch (error) {
            console.error('Error updating product:', error)
        }
    }

    const addCategory = async (name: string) => {
        try {
            await api.post('/inventory/categories', { name })
            await fetchProducts()
        } catch (error) {
            console.error('Error adding category:', error)
        }
    }

    const uploadImage = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await api.post('/inventory/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return res.data.url
        } catch (error) {
            console.error('Error uploading image:', error)
            throw error
        }
    }

    return {
        products,
        categories,
        isLoading,
        fetchProducts,
        updateStock,
        addProduct,
        updateProduct,
        addCategory,
        uploadImage
    }
})
