<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
    Plus, 
    Minus, 
    Trash2, 
    ShoppingCart, 
    ChevronDown,
    CircleDollarSign,
    LayoutGrid,
    ReceiptText,
    Loader2,
    Maximize2,
    Minimize2,
    Layers,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    FilePlus,
    ListTree
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

// Stores
import { useInventoryStore } from '@/stores/inventory'
import { useUIStore } from '@/stores/ui'
import { useShiftsStore } from '@/stores/shifts'
import { useTablesStore } from '@/stores/tables'
import api from '@/services/api'

// Utils & Components
import { generateTicketPDF } from '@/utils/pdf-generator'
import ManualProductModal from '@/components/ventas/ManualProductModal.vue'
import TableSelectorModal from '@/components/ventas/TableSelectorModal.vue'
import CheckoutModal from '@/components/ventas/CheckoutModal.vue'
import SuccessModal from '@/components/ventas/SuccessModal.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const inventoryStore = useInventoryStore()
const uiStore = useUIStore()
const shiftsStore = useShiftsStore()
const tablesStore = useTablesStore()
const router = useRouter()
const clientsStore = ref<{ clients: any[] }>({ clients: [] })

// --- State ---
const selectedCategory = ref<string | number>('')
const cart = ref<any[]>([])
const activeTab = ref<'products' | 'cart'>('products')
const isProcessing = ref(false)
const productsLimit = ref(30)

// Dialog State
const dialog = ref({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as any,
    onConfirm: () => {}
})

// Modals State
const isManualProductModalOpen = ref(false)
const isTableSelectorOpen = ref(false)
const isCheckoutModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const isOpenSalesModalOpen = ref(false)

// Misc State
const selectedTable = ref('01')
const isSwitching = ref(false)
const tables = Array.from({ length: 24 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const currency = ref('€')
const companySettings = ref<any>({})

// --- Historical Navigation ---
const recentInvoices = ref<any[]>([])
const viewingInvoiceIndex = ref<number | null>(null) // null = active order
const viewingInvoice = computed(() => viewingInvoiceIndex.value !== null ? recentInvoices.value[viewingInvoiceIndex.value] : null)

// IMAGE CACHE TRACKER is now handled by inventoryStore globally

// --- Data Fetching ---
const fetchSettings = async () => {
    try {
        const response = await api.get('/companies/settings')
        if (response.data) {
            companySettings.value = response.data
            currency.value = response.data.currency || '€'
        }
    } catch (error) {
        console.error('Error fetching settings:', error)
    }
}

onMounted(async () => {
    // ZEN MODE FOR VENTAS: Set state but don't force browser fullscreen (blocked by browser on mount)
    uiStore.isZenMode = true
    
    try {
        const res = await api.get('/clients')
        clientsStore.value.clients = res.data
    } catch (e) {}
    
    fetchSettings()
    if (inventoryStore.products.length === 0) {
        await inventoryStore.fetchProducts()
    }
    await tablesStore.fetchPendingOrders()
    await fetchRecentInvoices()
    
    if (tablesStore.pendingOrders[selectedTable.value]) {
        cart.value = [...tablesStore.pendingOrders[selectedTable.value]]
    }

    // PRELOADER REMOVED to avoid CPU congestion during interactions
})

const fetchRecentInvoices = async () => {
    try {
        const res = await api.get('/invoices')
        // Sort by date desc
        recentInvoices.value = res.data.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 50) // Keep last 50
    } catch (e) {
        console.error('Error fetching invoices:', e)
    }
}

const navQueue = computed(() => {
    const queue: any[] = []
    
    // Get all pending keys (including current selectedTable)
    const pendingKeys = Object.keys(tablesStore.pendingOrders)
    if (!pendingKeys.includes(selectedTable.value)) {
        pendingKeys.push(selectedTable.value)
    }
    
    // Sort keys so the order is stable during navigation
    pendingKeys.sort((a, b) => a.localeCompare(b))
    
    queue.push(...pendingKeys.map(k => ({ type: 'pending', id: k })))
    
    // 3. Recent Invoices
    const invoices = recentInvoices.value.map(inv => ({ type: 'invoice', id: inv.id }))
    queue.push(...invoices)
    
    return queue
})

const currentNavIndex = computed(() => {
    if (viewingInvoiceIndex.value !== null) {
        const inv = recentInvoices.value[viewingInvoiceIndex.value]
        if (!inv) return 0
        return navQueue.value.findIndex(item => item.type === 'invoice' && item.id === inv.id)
    }
    // Find index of current selectedTable in the pending section
    const idx = navQueue.value.findIndex(item => item.type === 'pending' && item.id === selectedTable.value)
    return idx !== -1 ? idx : 0
})

const navigateInvoices = async (direction: 'prev' | 'next') => {
    // Ensure we have latest invoices before navigating if needed
    if (recentInvoices.value.length === 0) await fetchRecentInvoices()
    
    const idx = currentNavIndex.value
    let targetIdx = idx
    
    if (direction === 'prev') {
        if (idx < navQueue.value.length - 1) targetIdx++
    } else {
        if (idx > 0) targetIdx--
    }
    
    if (targetIdx === idx) return
    
    const target = navQueue.value[targetIdx]
    
    if (target.type === 'pending') {
        viewingInvoiceIndex.value = null
        if (target.id !== selectedTable.value) {
            await openPendingSale(target.id)
        }
    } else if (target.type === 'invoice') {
        // Find invoice index in recentInvoices
        const invIdx = recentInvoices.value.findIndex(inv => inv.id === target.id)
        if (invIdx !== -1) {
            viewingInvoiceIndex.value = invIdx
            // When viewing invoice, we might want to "stop" showing the current table's cart
            // The template already handles this via viewingInvoiceIndex !== null
        }
    }
}

const backToActiveOrder = () => {
    viewingInvoiceIndex.value = null
}

const createGenericSale = async () => {
    // Generate a unique ID for this generic sale
    const timestamp = Date.now().toString().slice(-4)
    const newId = `TICK-${timestamp}`
    
    // Save current if needed
    if (cart.value.length > 0) {
        await tablesStore.saveTableOrder(selectedTable.value, cart.value, cartTotal.value)
    }
    
    selectedTable.value = newId
    cart.value = []
}

const openPendingSale = async (tableNumber: string) => {
    if (tableNumber === selectedTable.value) {
        isOpenSalesModalOpen.value = false
        return
    }

    if (cart.value.length > 0) {
        await tablesStore.saveTableOrder(selectedTable.value, cart.value, cartTotal.value)
    }
    
    selectedTable.value = tableNumber
    cart.value = [...(tablesStore.pendingOrders[tableNumber] || [])]
    isOpenSalesModalOpen.value = false
}

const isTable = (tableNumber: string) => {
    return !isNaN(Number(tableNumber)) && tableNumber.length <= 2
}


onUnmounted(() => {
    uiStore.isZenMode = false
})

// --- Computed ---
const dynamicCategories = computed(() => {
    return [...inventoryStore.categories]
})

// Auto-select first category when categories load
watch(dynamicCategories, (newCats) => {
    if (newCats.length > 0 && !selectedCategory.value) {
        selectedCategory.value = newCats[0].id
    }
}, { immediate: true })

// Deferred rendering to avoid lag when switching categories
watch(selectedCategory, () => {
    productsLimit.value = 30
    setTimeout(() => {
        productsLimit.value = 1000 // Render all items after initial frame
    }, 50)
})

const filteredProducts = computed(() => {
    let result = inventoryStore.products
    if (selectedCategory.value) {
        result = result.filter(p => p.category?.id === selectedCategory.value)
    }
    return result.slice(0, productsLimit.value)
})

const cartTotal = computed(() => cart.value.reduce((total, item) => total + (item.price * item.quantity), 0))
const cartCount = computed(() => cart.value.reduce((count, item) => count + item.quantity, 0))

// --- Methods ---
const addToCart = (product: any) => {
    const existing = cart.value.find(item => item.id === product.id && !item.isManual)
    if (existing) {
        existing.quantity++
    } else {
        cart.value.push({ ...product, quantity: 1, isManual: false })
    }
}

const addManualToCart = async (p: any) => {
    const manualItem = {
        id: Date.now(),
        ...p,
        isManual: true,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
    }
    cart.value.push(manualItem)
    
    try {
        await api.post('/audit-logs', {
            action: 'MANUAL_PRODUCT_ADDED',
            details: {
                table: selectedTable.value,
                item: { name: p.name, price: p.price }
            },
            reason: 'Se añadió un producto manual al pedido'
        })
    } catch (e) { console.error(e) }
    
    isManualProductModalOpen.value = false
}

const removeFromCart = async (productId: number) => {
    const index = cart.value.findIndex(item => item.id === productId)
    if (index > -1) {
        const item = cart.value[index]
        
        // Log sensitive removal if it's the last unit or a large quantity
        if (item.quantity === 1) {
             try {
                await api.post('/audit-logs', {
                    action: 'ITEM_REMOVED',
                    details: {
                        table: selectedTable.value,
                        item: { id: item.id, name: item.name, price: item.price }
                    },
                    reason: 'Producto eliminado del pedido'
                })
            } catch (e) { console.error(e) }
        }

        if (cart.value[index].quantity > 1) {
            cart.value[index].quantity--
        } else {
            cart.value.splice(index, 1)
        }
    }
}

const clearCart = async () => {
    if (cart.value.length > 0) {
        try {
            await api.post('/audit-logs', {
                action: 'ORDER_CANCELLED',
                details: {
                    table: selectedTable.value,
                    items: cart.value,
                    total: cartTotal.value
                },
                reason: 'El usuario vació el carrito manualmente'
            })
        } catch (e) {
            console.error('Error logging cancellation:', e)
        }
    }
    cart.value = []
}

const switchTable = async (tableNumber: string) => {
    if (tableNumber === selectedTable.value) {
        isTableSelectorOpen.value = false
        return
    }

    try {
        if (cart.value.length > 0) {
            await tablesStore.saveTableOrder(selectedTable.value, cart.value, cartTotal.value)
        } else {
            await tablesStore.clearTableOrder(selectedTable.value)
        }
    } catch (e) {
        console.error('Error saving table before switch:', e)
    }
    
    isSwitching.value = true
    selectedTable.value = tableNumber
    cart.value = [...(tablesStore.pendingOrders[tableNumber] || [])]
    
    setTimeout(() => isSwitching.value = false, 0)
    isTableSelectorOpen.value = false
}

const handleCheckout = async (data: { paymentMethod: string, shouldPrintTicket: boolean, clientId?: number }) => {
    const { paymentMethod, shouldPrintTicket, clientId } = data
    if (cart.value.length === 0) return
    isProcessing.value = true
    try {
        const total = cartTotal.value
        const vatRate = companySettings.value.vatRate || 10
        const vatAmount = total * (vatRate / 100)
        const taxableBase = total - vatAmount

        const invoiceData = {
            type: 'sale',
            clientName: clientsStore.value.clients.find(c => c.id === clientId)?.name || 'Cliente Genérico',
            clientId,
            amount: Number(total),
            taxableBase: Number(taxableBase),
            vatRate: Number(vatRate),
            vatAmount: Number(vatAmount),
            status: 'paid',
            paymentMethod,
            items: cart.value.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        }
        
        const response = await api.post('/invoices', invoiceData)
        if (shouldPrintTicket) {
            await generateTicketPDF(response.data, cart.value, companySettings.value, currency.value)
        }
        for (const item of cart.value) {
            if (!item.isManual) {
                await inventoryStore.updateStock(item.id, item.stock - item.quantity)
            }
        }
        await tablesStore.clearTableOrder(selectedTable.value)
        isCheckoutModalOpen.value = false
        // isSuccessModalOpen.value = true // REMOVED as requested
        
        // Refresh history
        await fetchRecentInvoices()
        
        clearCart()
        activeTab.value = 'products'
        
        /* 
        setTimeout(() => {
            isSuccessModalOpen.value = false
            clearCart()
            activeTab.value = 'products'
        }, 2000)
        */
    } catch (error) {
        console.error('Checkout error:', error)
        dialog.value = {
            isOpen: true,
            title: 'Error de Cobro',
            message: 'No se pudo procesar la venta. Por favor, revisa la conexión.',
            type: 'error',
            onConfirm: () => dialog.value.isOpen = false
        }
    } finally {
        isProcessing.value = false
    }
}

// Debounced sync to store to improve INP
let syncTimeout: any = null
watch(cart, (newCart) => {
    if (isSwitching.value) return
    
    clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
        tablesStore.pendingOrders[selectedTable.value] = [...newCart]
    }, 100) // Small delay to let UI breathe
}, { deep: true })
</script>

<template>
    <div class="h-full flex flex-col bg-background animate-in fade-in duration-500 overflow-hidden relative">
        
        <!-- NEW MINIMAL ZEN HEADER -->
        <header class="flex-shrink-0 flex items-center justify-between p-4 bg-card border-b border-border shadow-sm z-10">
            <div class="flex items-center gap-4">
                <button @click="router.push('/app/dashboard')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/20 text-foreground/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95">
                    <ArrowLeft class="w-5 h-5" />
                </button>
                <div class="flex flex-col">
                    <h1 class="text-sm font-black uppercase tracking-widest text-primary">Terminal de Ventas</h1>
                    <p class="text-[10px] font-bold text-foreground/40 italic">BarFlow POS • {{ isTable(selectedTable) ? 'Mesa' : 'Pedido' }} #{{ selectedTable }}</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3">
                <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-lg">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span class="text-[10px] font-black uppercase tracking-tighter text-foreground/60">Sistema Operativo</span>
                </div>
                <button @click="uiStore.toggleZenMode()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/30 text-foreground/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95">
                    <Maximize2 v-if="!uiStore.isZenMode" class="w-5 h-5" />
                    <Minimize2 v-else class="w-5 h-5" />
                </button>
            </div>
        </header>

        <div class="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-4 p-2 lg:p-4 overflow-hidden relative">
            <!-- Mobile Tab Switcher -->
            <div class="lg:hidden flex p-1 bg-accent/20 rounded-2xl mb-2 flex-shrink-0">
                <button @click="activeTab = 'products'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all" :class="activeTab === 'products' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'">
                    <LayoutGrid class="w-5 h-5" /> Productos
                </button>
                <button @click="activeTab = 'cart'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all relative" :class="activeTab === 'cart' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'">
                    <ReceiptText class="w-5 h-5" /> {{ isTable(selectedTable) ? 'Mesa' : 'Pedido' }} #{{ selectedTable }}
                    <span v-if="cartCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-background">
                        {{ cartCount }}
                    </span>
                </button>
            </div>

            <!-- Main Sales Area -->
            <main class="flex-1 flex flex-col gap-4 overflow-hidden transition-all duration-300" :class="activeTab === 'cart' ? 'hidden lg:flex' : 'flex'">
                
                <!-- CATEGORIES AT TOP -->
                <div class="flex-shrink-0 space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <Layers class="w-5 h-5 text-primary" />
                            <h2 class="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Categorías</h2>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto no-scrollbar pb-4">
                        <button 
                            v-for="cat in dynamicCategories" 
                            :key="cat.id" 
                            @click="selectedCategory = cat.id" 
                            class="flex-1 min-w-[120px] max-w-[200px] h-14 flex items-center justify-center px-4 rounded-2xl font-black transition-all border-2 text-center shadow-sm active:scale-95" 
                            :class="selectedCategory === cat.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-card border-border text-foreground/50 hover:bg-accent/50'"
                        >
                            <span class="text-[10px] lg:text-xs uppercase tracking-wider truncate">{{ cat.name }}</span>
                        </button>
                    </div>
                    <div class="h-px bg-border/50"></div>
                </div>

                <!-- Products Section -->
                <div class="flex-1 flex flex-col min-w-0 space-y-4 overflow-hidden">
                    <div class="flex-1 overflow-y-auto pr-1 lg:pr-2 no-scrollbar">
                        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-2 lg:gap-3 pb-20 lg:pb-10">
                            <button 
                                v-for="product in filteredProducts" 
                                :key="product.id" 
                                @click="addToCart(product)" 
                                class="product-card group flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden text-left active:scale-[0.98] touch-manipulation"
                            >
                                <div class="aspect-square relative bg-accent/5">
                                    <img 
                                        :src="(product as any).resolvedImage" 
                                        :alt="product.name" 
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    >
                                    <div class="absolute bottom-2 right-2 w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                        <Plus class="w-4 h-4" />
                                    </div>
                                </div>
                                <div class="p-2">
                                    <h3 class="font-bold text-foreground text-[10px] lg:text-xs truncate">{{ product.name }}</h3>
                                    <p class="text-primary font-black text-xs mt-0.5">{{ currency }}{{ Number(product.price).toFixed(2) }}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Sidebar: Order Review -->
            <aside class="w-full lg:w-72 xl:w-80 flex flex-col bg-card rounded-3xl border border-border shadow-xl overflow-hidden transition-all duration-300" :class="activeTab === 'products' ? 'hidden lg:flex' : 'flex flex-1'">
                
                <!-- HEADER: NAVIGATION & TABLE -->
                <div class="flex flex-col border-b border-border bg-accent/5">
                    <!-- ARROWS & SALE NUMBER -->
                    <div class="p-4 flex items-center justify-between border-b border-border/50">
                        <div class="flex items-center gap-2">
                            <button 
                                @click="createGenericSale" 
                                class="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                title="Nueva Venta Rápida"
                            >
                                <Plus class="w-5 h-5" />
                            </button>
                            <button 
                                @click="isOpenSalesModalOpen = true" 
                                class="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                title="Lista de Ventas Abiertas"
                            >
                                <ListTree class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="flex items-center bg-accent/20 rounded-2xl p-1 shadow-inner gap-2">
                            <button 
                                @click="navigateInvoices('prev')" 
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors text-foreground/40 disabled:opacity-20"
                                :disabled="currentNavIndex >= navQueue.length - 1"
                            >
                                <ChevronLeft class="w-5 h-5" />
                            </button>
                            
                            <div class="px-2 min-w-[100px] text-center">
                                <span v-if="viewingInvoiceIndex !== null" class="text-[10px] font-black text-primary uppercase tracking-tighter">Ticket #{{ viewingInvoice.id }}</span>
                                <span v-else-if="currentNavIndex > 0" class="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Pedido {{ selectedTable }}</span>
                                <span v-else class="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Venta Actual</span>
                            </div>

                            <button 
                                @click="navigateInvoices('next')" 
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors text-foreground/40 disabled:opacity-20"
                                :disabled="currentNavIndex === 0"
                            >
                                <ChevronRight class="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <!-- TABLE INFO SECTION (CLICKABLE) -->
                    <div 
                        v-if="viewingInvoiceIndex === null" 
                        @click="isTableSelectorOpen = true"
                        class="p-4 flex items-center justify-between border-t border-border/50 cursor-pointer hover:bg-primary/5 transition-all group relative overflow-hidden"
                    >
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                {{ isTable(selectedTable) ? 'M' : 'P' }}
                            </div>
                            <div>
                                <h3 class="font-black text-[10px] uppercase tracking-widest text-foreground/40 leading-none mb-1">
                                    {{ isTable(selectedTable) ? 'Mesa' : 'Pedido' }}
                                </h3>
                                <div class="flex items-center gap-2">
                                    <p class="text-2xl font-black text-foreground tracking-tighter">#{{ selectedTable }}</p>
                                    <ChevronDown class="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        <!-- Separate Delete Button (Not part of header click) -->
                        <button 
                            @click.stop="clearCart" 
                            class="w-10 h-10 flex items-center justify-center text-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                            title="Borrar todo el pedido"
                        >
                            <Trash2 class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- HISTORICAL BANNER -->
                    <div v-else class="bg-primary px-4 py-2 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                        <span class="text-[10px] font-black text-white uppercase tracking-widest">Modo Histórico</span>
                        <button @click="backToActiveOrder" class="text-[10px] font-black text-white bg-white/20 px-2 py-1 rounded flex items-center gap-1 hover:bg-white/30 transition-all">
                            VOLVER <ArrowRight class="w-3 h-3" />
                        </button>
                    </div>
                </div>
                
                <!-- QUICK ACTIONS -->
                <div class="px-4 py-3 bg-accent/5 border-b border-border">
                    <button 
                        @click="isManualProductModalOpen = true" 
                        class="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95"
                    >
                        <Plus class="w-4 h-4" /> Producto Manual
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar min-h-0">
                    <!-- ACTIVE ORDER CART -->
                    <template v-if="viewingInvoiceIndex === null">
                        <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-foreground/30 space-y-4">
                            <Plus class="w-12 h-12 opacity-20" />
                            <p class="text-sm font-medium italic text-center px-6">El pedido está vacío.</p>
                        </div>

                        <div v-for="item in cart" :key="item.id" class="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 rounded-2xl bg-accent/20 border border-transparent hover:border-primary/20 transition-all group">
                            <img :src="inventoryStore.resolveImageUrl(item.image)" class="w-12 h-12 lg:w-14 lg:h-14 rounded-xl object-cover">
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-xs lg:text-sm truncate">{{ item.name }}</h4>
                                <p class="text-primary font-black text-xs lg:text-sm">{{ currency }}{{ Number(item.price).toFixed(2) }}</p>
                            </div>
                            <div class="flex items-center gap-2 lg:gap-3">
                                <button @click="removeFromCart(item.id)" class="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-all active:scale-90"><Minus class="w-3 h-3" /></button>
                                <span class="font-black text-base lg:text-lg min-w-[1rem] text-center">{{ item.quantity }}</span>
                                <button @click="addToCart(item)" class="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"><Plus class="w-3 h-3" /></button>
                            </div>
                        </div>
                    </template>

                    <!-- HISTORICAL ORDER VIEW -->
                    <template v-else>
                        <div v-for="item in viewingInvoice.items" :key="item.id" class="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 rounded-2xl bg-accent/10 border border-border/50 opacity-80">
                            <div class="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black">
                                {{ item.quantity }}x
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-xs lg:text-sm truncate">{{ item.productName || item.name }}</h4>
                                <p class="text-primary font-black text-xs lg:text-sm">{{ currency }}{{ Number(item.price).toFixed(2) }}</p>
                            </div>
                        </div>
                        <div class="p-3 rounded-2xl border-2 border-dashed border-border/50 text-center bg-accent/5">
                            <p class="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Venta finalizada el {{ new Date(viewingInvoice.createdAt).toLocaleString() }}</p>
                        </div>
                    </template>
                </div>

                <div class="p-4 lg:p-6 bg-accent/10 border-t border-border space-y-3 lg:space-y-4">
                    <div class="flex justify-between items-end pt-1 lg:pt-2">
                        <span class="font-bold text-base lg:text-lg">Total</span>
                        <span class="font-black text-2xl lg:text-3xl text-primary">{{ currency }}{{ Number(viewingInvoiceIndex === null ? cartTotal : viewingInvoice.amount).toFixed(2) }}</span>
                    </div>
                    
                    <template v-if="viewingInvoiceIndex === null">
                        <button @click="isCheckoutModalOpen = true" :disabled="cart.length === 0 || isProcessing" class="w-full py-4 lg:py-5 bg-primary text-white rounded-2xl lg:rounded-[1.5rem] font-black text-lg lg:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                            Cobrar <CircleDollarSign class="w-5 h-5" />
                        </button>
                    </template>
                    <template v-else>
                        <button @click="generateTicketPDF(viewingInvoice, viewingInvoice.items, companySettings, currency)" class="w-full py-4 lg:py-5 bg-foreground text-background rounded-2xl lg:rounded-[1.5rem] font-black text-lg lg:text-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                            Re-imprimir Ticket <ReceiptText class="w-5 h-5" />
                        </button>
                    </template>
                </div>
            </aside>
        </div>

        <!-- Modals -->
        <ManualProductModal :is-open="isManualProductModalOpen" @close="isManualProductModalOpen = false" @add="addManualToCart" />
        <TableSelectorModal :is-open="isTableSelectorOpen" :selected-table="selectedTable" :pending-orders="tablesStore.pendingOrders" @close="isTableSelectorOpen = false" @select="switchTable" />
        <CheckoutModal :is-open="isCheckoutModalOpen" :cart="cart" :cart-total="cartTotal" :currency="currency" :is-processing="isProcessing" @close="isCheckoutModalOpen = false" @checkout="handleCheckout" />
        <SuccessModal :is-open="isSuccessModalOpen" />
        
        <!-- OPEN SALES MODAL -->
        <AppDialog 
            :is-open="isOpenSalesModalOpen" 
            title="Ventas y Mesas Abiertas" 
            @close="isOpenSalesModalOpen = false"
        >
            <div class="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar py-2">
                <div v-if="Object.keys(tablesStore.pendingOrders).length === 0" class="py-10 text-center text-foreground/20 italic">
                    No hay ventas pendientes en este momento.
                </div>
                <div 
                    v-for="(items, tableId) in tablesStore.pendingOrders" 
                    :key="tableId"
                    @click="openPendingSale(tableId)"
                    class="p-4 rounded-2xl border border-border bg-accent/5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group flex items-center justify-between"
                    :class="tableId === selectedTable ? 'ring-2 ring-primary bg-primary/5' : ''"
                >
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black" :class="isTable(tableId) ? 'bg-primary text-white' : 'bg-emerald-500 text-white'">
                            {{ isTable(tableId) ? 'M' : 'P' }}
                        </div>
                        <div>
                            <h4 class="font-black text-sm uppercase tracking-tight">
                                {{ isTable(tableId) ? 'Mesa' : 'Pedido' }} #{{ tableId }}
                            </h4>
                            <p class="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                                {{ items.length }} productos • {{ items.reduce((acc, i) => acc + i.quantity, 0) }} uds.
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-black text-primary">
                            {{ currency }}{{ items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2) }}
                        </p>
                    </div>
                </div>
            </div>
            <template #footer>
                <BaseButton variant="secondary" @click="isOpenSalesModalOpen = false" class="w-full">Cerrar</BaseButton>
            </template>
        </AppDialog>
        
        <AppDialog 
            :is-open="dialog.isOpen"
            :title="dialog.title"
            :message="dialog.message"
            :type="dialog.type"
            @confirm="dialog.onConfirm"
            @close="dialog.isOpen = false"
            @cancel="dialog.isOpen = false"
        />
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.product-card {
    content-visibility: auto;
    contain-intrinsic-size: 100px 150px;
}

.animate-pulse-subtle {
    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-subtle {
    0%, 100% { background-color: rgba(0, 0, 0, 0.05); }
    50% { background-color: rgba(0, 0, 0, 0.1); }
}

.group img, .group .absolute {
    will-change: transform, opacity;
}

button {
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
}
</style>
