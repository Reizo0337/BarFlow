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
    const loadedImages = ref<Record<string, boolean>>({})

    const markAsLoaded = (url: string) => {
        if (!url) return
        const fullUrl = resolveImageUrl(url)
        loadedImages.value[fullUrl] = true
    }

    const isImageLoaded = (url: string) => {
        const fullUrl = resolveImageUrl(url)
        return !!loadedImages.value[fullUrl]
    }

    const fetchProducts = async () => {
        isLoading.value = true
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/inventory/categories')
            ])

            // Pre-process URLs and data once to avoid CPU spikes during render
            products.value = prodRes.data.map((p: Product) => ({
                ...p,
                // Add a pre-resolved image property
                resolvedImage: resolveImageUrl(p.image)
            }))
            categories.value = catRes.data
        } catch (error) {
            console.error('Error fetching inventory or categories:', error)
        } finally {
            isLoading.value = false
        }
    }

    const updateStock = async (id: number, delta: number) => {
        try {
            await api.patch(`/inventory/${id}/stock`, { delta })
            await fetchProducts()
        } catch (error) {
            console.error('Error updating stock:', error)
        }
    }

    const addProduct = async (data: any) => {
        try {
            await api.post('/inventory', data)
            // Separate refresh so creation failure is isolated
            try {
                await fetchProducts()
            } catch (e) {
                console.warn('Product created but refresh failed:', e)
            }
        } catch (error) {
            console.error('Error adding product:', error)
            throw error
        }
    }

    const updateProduct = async (id: number, data: any) => {
        try {
            await api.patch(`/inventory/${id}`, data)
            await fetchProducts()
        } catch (error) {
            console.error('Error updating product:', error)
            throw error
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
    const resolveImageUrl = (url?: string) => {
        if (!url) return ''

        // Optimize Unsplash images dynamically
        let finalUrl = url
        if (url.startsWith('https://images.unsplash.com/')) {
            if (!url.includes('?')) {
                finalUrl = `${url}?auto=format&fit=crop&w=200&h=200&q=80`
            }
        }

        if (finalUrl.startsWith('http')) return finalUrl
        const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000'
        return `${baseUrl}${finalUrl}`
    }

    const applyTemplate = async (template: any[]) => {
        console.log('Applying inventory template...', template.length, 'items');
        isLoading.value = true
        try {
            await api.post('/inventory/apply-template', template)
            await fetchProducts()
        } catch (error) {
            console.error('Error applying template:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        products,
        categories,
        isLoading,
        loadedImages,
        markAsLoaded,
        isImageLoaded,
        fetchProducts,
        updateStock,
        addProduct,
        updateProduct,
        addCategory,
        uploadImage,
        resolveImageUrl,
        applyTemplate
    }
})
