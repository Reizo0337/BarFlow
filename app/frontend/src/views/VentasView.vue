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
    ArrowLeft
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

const inventoryStore = useInventoryStore()
const uiStore = useUIStore()
const shiftsStore = useShiftsStore()
const tablesStore = useTablesStore()
const router = useRouter()
const clientsStore = ref<{ clients: any[] }>({ clients: [] })

// --- State ---
const selectedCategory = ref<string | number>('all')
const cart = ref<any[]>([])
const activeTab = ref<'products' | 'cart'>('products')
const isProcessing = ref(false)

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

// Misc State
const selectedTable = ref('01')
const isSwitching = ref(false)
const tables = Array.from({ length: 24 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const currency = ref('€')
const companySettings = ref<any>({})

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
    
    if (tablesStore.pendingOrders[selectedTable.value]) {
        cart.value = [...tablesStore.pendingOrders[selectedTable.value]]
    }
})

onUnmounted(() => {
    uiStore.isZenMode = false
})

// --- Computed ---
const dynamicCategories = computed(() => {
    const base = [{ id: 'all', name: 'Todo' }]
    const fromBackend = inventoryStore.categories.map(cat => ({ id: cat.id, name: cat.name }))
    return [...base, ...fromBackend]
})

const filteredProducts = computed(() => {
    let result = inventoryStore.products
    if (selectedCategory.value !== 'all') {
        result = result.filter(p => p.category?.id === selectedCategory.value)
    }
    return result
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
        isSuccessModalOpen.value = true
        setTimeout(() => {
            isSuccessModalOpen.value = false
            clearCart()
            activeTab.value = 'products'
        }, 2000)
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

watch(cart, (newCart) => {
    if (isSwitching.value) return
    tablesStore.pendingOrders[selectedTable.value] = [...newCart]
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
                    <p class="text-[10px] font-bold text-foreground/40 italic">BarFlow POS • Mesa #{{ selectedTable }}</p>
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
                    <ReceiptText class="w-5 h-5" /> Mesa #{{ selectedTable }}
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

                    <div class="max-h-[400px] overflow-y-auto no-scrollbar pb-4 w-full">
                        <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
                            <button 
                                v-for="cat in dynamicCategories" 
                                :key="cat.id" 
                                @click="selectedCategory = cat.id" 
                                class="aspect-square flex flex-col items-center justify-center p-2 rounded-[1.5rem] font-black transition-all border-2 text-center break-words leading-tight shadow-sm active:scale-95" 
                                :class="selectedCategory === cat.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-card border-border text-foreground/50 hover:bg-accent/50'"
                            >
                                <span class="text-[10px] lg:text-xs uppercase tracking-wider">{{ cat.name }}</span>
                            </button>
                        </div>
                    </div>
                    <div class="h-px bg-border/50"></div>
                </div>

                <!-- Products Section -->
                <div class="flex-1 flex flex-col min-w-0 space-y-4 overflow-hidden">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <h2 class="text-xl font-black uppercase tracking-tighter text-foreground/20">Productos</h2>
                            <div class="h-1 w-12 bg-primary/20 rounded-full"></div>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto pr-1 lg:pr-2 no-scrollbar">
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 pb-20 lg:pb-10">
                            <button v-for="product in filteredProducts" :key="product.id" @click="addToCart(product)" class="group flex flex-col bg-card rounded-2xl lg:rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all overflow-hidden text-left active:scale-[0.98] touch-manipulation">
                                <div class="aspect-square relative overflow-hidden">
                                    <img :src="inventoryStore.resolveImageUrl(product.image)" :alt="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                                    <div class="absolute bottom-3 right-3 w-8 h-8 lg:w-10 lg:h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg transform lg:translate-y-4 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                        <Plus class="w-5 h-5 lg:w-6 lg:h-6" />
                                    </div>
                                </div>
                                <div class="p-3 lg:p-4">
                                    <h3 class="font-bold text-foreground text-sm lg:text-base truncate">{{ product.name }}</h3>
                                    <p class="text-primary font-black text-base lg:text-lg">{{ currency }}{{ Number(product.price).toFixed(2) }}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Sidebar: Order Review -->
            <aside class="w-full lg:w-72 xl:w-80 flex flex-col bg-card rounded-3xl border border-border shadow-xl overflow-hidden transition-all duration-300" :class="activeTab === 'products' ? 'hidden lg:flex' : 'flex flex-1'">
                <div class="p-4 lg:p-6 border-b border-border flex items-center justify-between bg-accent/10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <ShoppingCart class="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 class="font-black text-lg">Mesa #{{ selectedTable }}</h2>
                            <button @click="isTableSelectorOpen = true" class="text-[10px] lg:text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:underline">
                                Cambiar Mesa <ChevronDown class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <button @click="clearCart" class="text-foreground/30 hover:text-destructive transition-colors p-2">
                        <Trash2 class="w-5 h-5" />
                    </button>
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
                </div>

                <div class="p-4 lg:p-6 bg-accent/10 border-t border-border space-y-3 lg:space-y-4">
                    <div class="flex justify-between items-end pt-1 lg:pt-2">
                        <span class="font-bold text-base lg:text-lg">Total</span>
                        <span class="font-black text-2xl lg:text-3xl text-primary">{{ currency }}{{ Number(cartTotal).toFixed(2) }}</span>
                    </div>
                    <button @click="isCheckoutModalOpen = true" :disabled="cart.length === 0 || isProcessing" class="w-full py-4 lg:py-5 bg-primary text-white rounded-2xl lg:rounded-[1.5rem] font-black text-lg lg:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                        Cobrar <CircleDollarSign class="w-5 h-5" />
                    </button>
                </div>
            </aside>
        </div>

        <!-- Modals -->
        <ManualProductModal :is-open="isManualProductModalOpen" @close="isManualProductModalOpen = false" @add="addManualToCart" />
        <TableSelectorModal :is-open="isTableSelectorOpen" :selected-table="selectedTable" :tables="tables" :pending-orders="tablesStore.pendingOrders" @close="isTableSelectorOpen = false" @select="switchTable" />
        <CheckoutModal :is-open="isCheckoutModalOpen" :cart="cart" :cart-total="cartTotal" :currency="currency" :is-processing="isProcessing" @close="isCheckoutModalOpen = false" @checkout="handleCheckout" />
        <SuccessModal :is-open="isSuccessModalOpen" />
        
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
</style>
