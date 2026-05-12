<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    ShoppingCart, 
    User, 
    Grid2X2,
    Utensils,
    Coffee,
    Wine,
    ChevronDown,
    CircleDollarSign,
    LayoutGrid,
    ReceiptText,
    Loader2,
    Maximize2,
    Minimize2,
    CreditCard,
    Banknote,
    Printer,
    CheckCircle2,
    Delete,
    Settings,
    Euro,
    DollarSign
} from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useShiftsStore } from '@/stores/shifts'
import { useTablesStore } from '@/stores/tables'
import api from '@/services/api'

const inventoryStore = useInventoryStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const shiftsStore = useShiftsStore()
const tablesStore = useTablesStore()

// --- State ---
const now = ref(new Date())
let timer: any = null

const hoursWorked = computed(() => {
    if (!shiftsStore.currentShift) return '00:00:00'
    const start = new Date(shiftsStore.currentShift.startTime)
    const diff = now.value.getTime() - start.getTime()
    
    const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0')
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0')
    const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0')
    
    return `${h}:${m}:${s}`
})

const selectedCategory = ref<string | number>('all')
const cart = ref<any[]>([])
const activeTab = ref<'products' | 'cart'>('products')
const isProcessing = ref(false)

// Categories definition (Dynamic from backend)
const dynamicCategories = computed(() => {
    const base = [{ id: 'all', name: 'Todo' }]
    const fromBackend = inventoryStore.categories.map(cat => {
        return { id: cat.id, name: cat.name }
    })
    return [...base, ...fromBackend]
})

// Manual Product State
const isManualProductModalOpen = ref(false)
const manualProduct = ref({
    name: '',
    price: 0,
    quantity: 1
})

// Tables & Pending Orders State
const selectedTable = ref('01')
const isTableSelectorOpen = ref(false)
const isSwitching = ref(false)
const tables = Array.from({ length: 24 }, (_, i) => (i + 1).toString().padStart(2, '0'))

// Checkout Modal State
const isCheckoutModalOpen = ref(false)
const paymentMethod = ref<'cash' | 'card'>('cash')
const amountReceived = ref(0)
const shouldPrintTicket = ref(true)
const isSuccessModalOpen = ref(false)

// Currency State
const currency = ref('$')
const companySettings = ref({
    currency: '€',
    legalName: '',
    nif: '',
    address: '',
    phone: '',
    vatRate: 10,
    nextInvoiceNumber: 1
})

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

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const generateTicketPDF = (invoice: any) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 150] // POS thermal printer size
    })

    const margin = 5
    let cursorY = 10

    // Header: Company Info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(companySettings.value.legalName || 'BARFLOW POS', 40, cursorY, { align: 'center' })
    cursorY += 5
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    if (companySettings.value.nif) {
        doc.text(`NIF: ${companySettings.value.nif}`, 40, cursorY, { align: 'center' })
        cursorY += 4
    }
    if (companySettings.value.address) {
        doc.text(companySettings.value.address, 40, cursorY, { align: 'center', maxWidth: 70 })
        cursorY += 4
    }
    if (companySettings.value.phone) {
        doc.text(`Tel: ${companySettings.value.phone}`, 40, cursorY, { align: 'center' })
        cursorY += 4
    }

    cursorY += 2
    doc.setLineWidth(0.1)
    doc.line(margin, cursorY, 80 - margin, cursorY)
    cursorY += 5

    // Invoice Info
    doc.setFont('helvetica', 'bold')
    doc.text(`TICKET: ${invoice.invoiceNumber}`, margin, cursorY)
    cursorY += 4
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, cursorY)
    cursorY += 6

    // Items Table
    const tableData = cart.value.map(item => [
        item.name,
        item.quantity.toString(),
        `${currency.value}${Number(item.price).toFixed(2)}`,
        `${currency.value}${(item.price * item.quantity).toFixed(2)}`
    ])

    autoTable(doc, {
        startY: cursorY,
        head: [['Cant.', 'Prod.', 'Precio', 'Total']],
        body: cart.value.map(item => [
            item.quantity.toString(),
            item.name,
            `${Number(item.price).toFixed(2)}`,
            `${(item.price * item.quantity).toFixed(2)}`
        ]),
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 12, halign: 'right' },
            3: { cellWidth: 12, halign: 'right' }
        },
        margin: { left: margin, right: margin }
    })

    cursorY = (doc as any).lastAutoTable.finalY + 5

    // Totals
    doc.line(margin, cursorY, 80 - margin, cursorY)
    cursorY += 5
    
    const vatAmount = cartTotal.value * (companySettings.value.vatRate / 100)
    const subtotal = cartTotal.value - vatAmount

    doc.text('Base Imponible:', 45, cursorY, { align: 'right' })
    doc.text(`${currency.value}${subtotal.toFixed(2)}`, 75, cursorY, { align: 'right' })
    cursorY += 4

    doc.text(`IVA (${companySettings.value.vatRate}%):`, 45, cursorY, { align: 'right' })
    doc.text(`${currency.value}${vatAmount.toFixed(2)}`, 75, cursorY, { align: 'right' })
    cursorY += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 45, cursorY, { align: 'right' })
    doc.text(`${currency.value}${cartTotal.value.toFixed(2)}`, 75, cursorY, { align: 'right' })

    cursorY += 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('¡Gracias por su visita!', 40, cursorY, { align: 'center' })

    // Save/Download
    doc.save(`Ticket_${invoice.invoiceNumber}.pdf`)
}

onMounted(() => {
    fetchSettings()
})

import { Pizza, X, CreditCard, Banknote, Printer, CheckCircle2, Delete, Settings, Euro, DollarSign } from 'lucide-vue-next'

const changeDue = computed(() => {
    if (paymentMethod.value !== 'cash') return 0
    return Math.max(0, amountReceived.value - cartTotal.value)
})

// --- Keypad Logic ---
const appendDigit = (digit: string) => {
    const current = amountReceived.value.toString()
    if (digit === '.' && current.includes('.')) return
    
    if (current === '0' && digit !== '.') {
        amountReceived.value = parseFloat(digit)
    } else {
        amountReceived.value = parseFloat(current + digit)
    }
}

const backspace = () => {
    const current = amountReceived.value.toString()
    if (current.length <= 1) {
        amountReceived.value = 0
    } else {
        amountReceived.value = parseFloat(current.slice(0, -1))
    }
}

const quickCash = (amount: number) => {
    amountReceived.value = amount
}

const openCheckoutModal = () => {
    if (cart.value.length === 0) return
    amountReceived.value = 0 // Start at 0 for touch input
    isCheckoutModalOpen.value = true
}

const switchTable = async (tableNumber: string) => {
    if (tableNumber === selectedTable.value) {
        isTableSelectorOpen.value = false
        return
    }

    // 1. Force save current table state to backend
    try {
        if (cart.value.length > 0) {
            await tablesStore.saveTableOrder(selectedTable.value, cart.value, cartTotal.value)
        } else {
            await tablesStore.clearTableOrder(selectedTable.value)
        }
    } catch (e) {
        console.error('Error saving table before switch:', e)
    }
    
    // 2. Switch table with flag to avoid watch interference
    isSwitching.value = true
    selectedTable.value = tableNumber
    cart.value = [...(tablesStore.pendingOrders[tableNumber] || [])]
    
    // Give Vue a tick to process the change
    setTimeout(() => {
        isSwitching.value = false
    }, 0)
    
    isTableSelectorOpen.value = false
}

// Autosave locally to the store whenever the cart changes
watch(cart, (newCart) => {
    if (isSwitching.value) return
    tablesStore.pendingOrders[selectedTable.value] = [...newCart]
}, { deep: true })

onMounted(async () => {
    if (inventoryStore.products.length === 0) {
        await inventoryStore.fetchProducts()
    }
    await tablesStore.fetchPendingOrders()
    
    // Load initial table if there's a pending order
    if (tablesStore.pendingOrders[selectedTable.value]) {
        cart.value = [...tablesStore.pendingOrders[selectedTable.value]]
    }
})

onUnmounted(() => {
    uiStore.toggleZenMode(false)
})

// --- Computed ---
const filteredProducts = computed(() => {
    let result = inventoryStore.products
    if (selectedCategory.value !== 'all') {
        result = result.filter(p => p.category?.id === selectedCategory.value)
    }
    return result
})

const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const cartCount = computed(() => {
    return cart.value.reduce((count, item) => count + item.quantity, 0)
})

// --- Methods ---
const addToCart = (product: any) => {
    const existing = cart.value.find(item => item.id === product.id && !item.isManual)
    if (existing) {
        existing.quantity++
    } else {
        cart.value.push({ ...product, quantity: 1, isManual: false })
    }
}

const addManualToCart = () => {
    if (!manualProduct.value.name || manualProduct.value.price <= 0) return
    
    cart.value.push({
        id: Date.now(),
        name: manualProduct.value.name,
        price: manualProduct.value.price,
        quantity: manualProduct.value.quantity,
        isManual: true,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
    })
    
    isManualProductModalOpen.value = false
    manualProduct.value = { name: '', price: 0, quantity: 1 }
}

const removeFromCart = (productId: number) => {
    const index = cart.value.findIndex(item => item.id === productId)
    if (index > -1) {
        if (cart.value[index].quantity > 1) {
            cart.value[index].quantity--
        } else {
            cart.value.splice(index, 1)
        }
    }
}

const clearCart = () => {
    cart.value = []
}

const handleCheckout = async () => {
    if (cart.value.length === 0) return
    
    isProcessing.value = true
    try {
        const invoiceData = {
            type: 'sale',
            clientName: 'Cliente Contado',
            amount: cartTotal.value,
            status: 'paid',
            paymentMethod: paymentMethod.value
        }
        
        const response = await api.post('/invoices', invoiceData)
        
        if (shouldPrintTicket.value) {
            generateTicketPDF(response.data)
        }
        
        // Update stock for each item
        for (const item of cart.value) {
            if (!item.isManual) {
                await inventoryStore.updateStock(item.id, item.stock - item.quantity)
            }
        }
        
        // Clear pending order for this table
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
        alert('Error al procesar la venta')
    } finally {
        isProcessing.value = false
    }
}
</script>

<template>
    <div 
        class="h-full flex flex-col lg:flex-row gap-2 lg:gap-4 animate-in fade-in duration-500 overflow-hidden relative"
        :class="uiStore.isZenMode ? 'p-2 lg:p-4 bg-background' : ''"
    >
        
        <!-- Mobile Tab Switcher -->
        <div class="lg:hidden flex p-1 bg-accent/20 rounded-2xl mb-2 flex-shrink-0">
            <button 
                @click="activeTab = 'products'"
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                :class="activeTab === 'products' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
            >
                <LayoutGrid class="w-5 h-5" />
                Productos
            </button>
            <button 
                @click="activeTab = 'cart'"
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all relative"
                :class="activeTab === 'cart' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
            >
                <ReceiptText class="w-5 h-5" />
                Mesa #{{ selectedTable }}
                <span v-if="cartCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-background">
                    {{ cartCount }}
                </span>
            </button>
        </div>

        <!-- Main Sales Area (Left / Center) -->
        <main 
            class="flex-1 flex flex-row gap-4 overflow-hidden transition-all duration-300"
            :class="[
                activeTab === 'cart' ? 'hidden lg:flex' : 'flex'
            ]"
        >
            <!-- Category Sidebar (Vertical) -->
            <aside class="w-20 lg:w-24 flex flex-col gap-2 overflow-y-auto no-scrollbar py-1 flex-shrink-0">
                <div class="flex-1 space-y-2">
                    <button 
                        v-for="cat in dynamicCategories" 
                        :key="cat.id"
                        @click="selectedCategory = cat.id"
                        class="w-full flex items-center justify-center p-2 min-h-[70px] lg:min-h-[85px] rounded-2xl font-black transition-all touch-manipulation border-2 text-center break-words leading-tight"
                        :class="selectedCategory === cat.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-card border-border text-foreground/40 hover:bg-accent/50'"
                    >
                        <span class="text-[9px] lg:text-[10px] uppercase tracking-tighter">{{ cat.name }}</span>
                    </button>
                </div>

                <!-- Bottom Sidebar Controls -->
                <div class="space-y-2 mt-auto pt-4">
                    <button 
                        @click="isManualProductModalOpen = true"
                        class="w-full aspect-square flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all group"
                        title="Producto Manual"
                    >
                        <Plus class="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </aside>

            <!-- Products Section -->
            <div class="flex-1 flex flex-col min-w-0 space-y-4">
                <!-- Top Controls: Zen Mode & Status -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <h2 class="text-xl font-black uppercase tracking-tighter text-foreground/20">Productos</h2>
                        <div class="h-1 w-12 bg-primary/20 rounded-full"></div>
                    </div>
                    
                    <button 
                        @click="uiStore.toggleZenMode()"
                        class="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent/30 text-foreground/50 hover:bg-primary/10 hover:text-primary transition-all group"
                        title="Modo Zen (Pantalla Completa)"
                    >
                        <Maximize2 v-if="!uiStore.isZenMode" class="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                        <Minimize2 v-else class="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <!-- Products Grid -->
                <div class="flex-1 overflow-y-auto pr-1 lg:pr-2 no-scrollbar">
                    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 pb-20 lg:pb-10">
                        <button 
                            v-for="product in filteredProducts" 
                            :key="product.id"
                            @click="addToCart(product)"
                            class="group flex flex-col bg-card rounded-2xl lg:rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all overflow-hidden text-left active:scale-[0.98] touch-manipulation"
                        >
                            <div class="aspect-square relative overflow-hidden">
                                <img :src="product.image" :alt="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity"></div>
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

        <!-- Sidebar: Order Review (Right) -->
        <aside 
            class="w-full lg:w-72 xl:w-80 flex flex-col bg-card rounded-3xl border border-border shadow-xl overflow-hidden transition-all duration-300"
            :class="[
                activeTab === 'products' ? 'hidden lg:flex' : 'flex flex-1'
            ]"
        >
            <!-- Order Header -->
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
                <button @click="clearCart" class="text-foreground/30 hover:text-destructive transition-colors active:scale-90 touch-manipulation p-2">
                    <Trash2 class="w-5 h-5" />
                </button>
            </div>

            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar min-h-0">
                <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-foreground/30 space-y-4">
                    <div class="w-12 h-12 lg:w-16 lg:h-16 bg-accent/20 rounded-full flex items-center justify-center">
                        <Plus class="w-6 h-6 lg:w-8 lg:h-8 opacity-20" />
                    </div>
                    <p class="text-sm font-medium italic text-center px-6">El pedido está vacío.<br>Añade algunos productos.</p>
                </div>

                <div 
                    v-for="item in cart" 
                    :key="item.id"
                    class="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 rounded-2xl bg-accent/20 border border-transparent hover:border-primary/20 transition-all group"
                >
                    <img :src="item.image" class="w-12 h-12 lg:w-14 lg:h-14 rounded-xl object-cover shadow-sm">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-xs lg:text-sm truncate">{{ item.name }}</h4>
                        <p class="text-primary font-black text-xs lg:text-sm">${{ Number(item.price).toFixed(2) }}</p>
                    </div>
                    <div class="flex items-center gap-2 lg:gap-3">
                        <button @click="removeFromCart(item.id)" class="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-all active:scale-90 touch-manipulation">
                            <Minus class="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <span class="font-black text-base lg:text-lg min-w-[1rem] text-center">{{ item.quantity }}</span>
                        <button @click="addToCart(item)" class="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90 touch-manipulation">
                            <Plus class="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Total & Checkout -->
            <div class="p-4 lg:p-6 bg-accent/10 border-t border-border space-y-3 lg:space-y-4">
                <div class="space-y-1 lg:space-y-2">
                    <div class="flex justify-between text-foreground/50 font-medium text-xs lg:text-sm">
                        <span>Subtotal</span>
                        <span>${{ (Number(cartTotal) * 0.9).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-foreground/50 font-medium text-xs lg:text-sm">
                        <span>IVA (10%)</span>
                        <span>${{ (Number(cartTotal) * 0.1).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-end pt-1 lg:pt-2">
                        <span class="font-bold text-base lg:text-lg">Total</span>
                        <span class="font-black text-2xl lg:text-3xl text-primary">${{ Number(cartTotal).toFixed(2) }}</span>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <button 
                        @click="openCheckoutModal"
                        :disabled="cart.length === 0 || isProcessing"
                        class="w-full py-4 lg:py-5 bg-primary text-white rounded-2xl lg:rounded-[1.5rem] font-black text-lg lg:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-3 touch-manipulation"
                    >
                        <Loader2 v-if="isProcessing" class="w-6 h-6 animate-spin" />
                        <template v-else>
                            Cobrar
                            <CircleDollarSign class="w-5 h-5 lg:w-6 lg:h-6" />
                        </template>
                    </button>
                </div>
            </div>
        </aside>

        <!-- Floating Cart Bubble (Mobile Only) -->
        <button 
            v-if="activeTab === 'products' && cartCount > 0"
            @click="activeTab = 'cart'"
            class="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce duration-1000 z-50 transition-all active:scale-90"
        >
            <div class="relative">
                <ShoppingCart class="w-7 h-7" />
                <span class="absolute -top-3 -right-3 w-6 h-6 bg-destructive text-white text-xs flex items-center justify-center rounded-full border-2 border-primary font-black">
                    {{ cartCount }}
                </span>
            </div>
        </button>

        <!-- Manual Product Modal -->
        <div v-if="isManualProductModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div class="bg-card w-full max-w-md rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-8 space-y-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-black">Producto Manual</h3>
                        <button @click="isManualProductModalOpen = false" class="p-2 hover:bg-accent/50 rounded-xl transition-colors">
                            <X class="w-6 h-6" />
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nombre del producto</label>
                            <input v-model="manualProduct.name" type="text" placeholder="Ej: Plato Especial" class="w-full bg-accent/20 border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Precio</label>
                                <input v-model.number="manualProduct.price" type="number" step="0.01" class="w-full bg-accent/20 border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Cantidad</label>
                                <input v-model.number="manualProduct.quantity" type="number" class="w-full bg-accent/20 border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            </div>
                        </div>
                    </div>

                    <button @click="addManualToCart" class="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        Añadir al Pedido
                    </button>
                </div>
            </div>
        </div>

        <!-- Table Selector Modal -->
        <div v-if="isTableSelectorOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div class="bg-card w-full max-w-5xl rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-8 lg:p-12 space-y-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-3xl font-black">Seleccionar Mesa</h3>
                            <p class="text-foreground/40 font-bold">Selecciona una mesa para gestionar su pedido</p>
                        </div>
                        <button @click="isTableSelectorOpen = false" class="p-3 hover:bg-accent/50 rounded-2xl transition-colors">
                            <X class="w-8 h-8" />
                        </button>
                    </div>

                    <div class="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar p-1">
                        <button 
                            v-for="table in tables" 
                            :key="table"
                            @click="switchTable(table)"
                            class="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2"
                            :class="[
                                selectedTable === table ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-accent/20 border-transparent hover:border-primary/30',
                                tablesStore.pendingOrders[table]?.length > 0 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-card' : ''
                            ]"
                        >
                            <span class="text-[10px] font-black opacity-40 uppercase">Mesa</span>
                            <span class="text-xl font-black">{{ table }}</span>
                            <div v-if="tablesStore.pendingOrders[table]?.length > 0" class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Checkout Modal -->
        <div v-if="isCheckoutModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 lg:p-4 animate-in fade-in duration-300">
            <div class="bg-card w-full max-w-[95vw] lg:max-w-7xl rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col lg:flex-row h-[90vh] lg:h-auto max-h-[95vh]">
                
                <!-- Col 1: Summary -->
                <div class="lg:w-1/4 p-6 lg:p-8 bg-accent/5 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto no-scrollbar">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <ReceiptText class="w-6 h-6" />
                        </div>
                        <h3 class="text-xl font-black">Resumen</h3>
                    </div>
                    
                    <div class="space-y-3 mb-6">
                        <div v-for="item in cart" :key="item.id" class="flex justify-between items-start text-xs font-bold gap-2">
                            <span class="text-foreground/60 leading-tight">{{ item.quantity }}x {{ item.name }}</span>
                            <span class="whitespace-nowrap">{{ currency }}{{ (item.price * item.quantity).toFixed(2) }}</span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-border space-y-3 mt-auto">
                        <div class="flex justify-between items-center text-foreground/40 text-xs">
                            <span>Subtotal</span>
                            <span>${{ (cartTotal * 0.9).toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between items-center text-foreground/40 text-xs">
                            <span>IVA (10%)</span>
                            <span>${{ (cartTotal * 0.1).toFixed(2) }}</span>
                        </div>
                        <div class="flex flex-col pt-2">
                            <span class="text-[10px] font-black uppercase text-primary/40 tracking-widest">Total a Pagar</span>
                            <span class="text-4xl font-black text-primary">{{ currency }}{{ cartTotal.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Col 2: Payment Methods & Options -->
                <div class="flex-1 p-6 lg:p-8 space-y-6 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-border">
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-black">Cobro</h3>
                        <button @click="isCheckoutModalOpen = false" class="lg:hidden p-2 hover:bg-accent/50 rounded-xl transition-colors">
                            <X class="w-6 h-6" />
                        </button>
                    </div>

                    <!-- Payment Method Toggle -->
                    <div class="grid grid-cols-2 gap-3 p-1 bg-accent/20 rounded-2xl">
                        <button 
                            @click="paymentMethod = 'cash'"
                            class="flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black"
                            :class="paymentMethod === 'cash' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
                        >
                            <Banknote class="w-6 h-6" />
                            Efectivo
                        </button>
                        <button 
                            @click="paymentMethod = 'card'"
                            class="flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black"
                            :class="paymentMethod === 'card' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
                        >
                            <CreditCard class="w-6 h-6" />
                            Tarjeta
                        </button>
                    </div>

                    <!-- Ticket Option (Touch Friendly) -->
                    <div class="space-y-3">
                        <span class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Opciones de Ticket</span>
                        <div class="grid grid-cols-2 gap-3 p-1 bg-accent/20 rounded-2xl">
                            <button 
                                @click="shouldPrintTicket = true"
                                class="flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs"
                                :class="shouldPrintTicket ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
                            >
                                <Printer class="w-4 h-4" />
                                Imprimir
                            </button>
                            <button 
                                @click="shouldPrintTicket = false"
                                class="flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs"
                                :class="!shouldPrintTicket ? 'bg-card text-foreground/60 shadow-sm' : 'text-foreground/40'"
                            >
                                <X class="w-4 h-4" />
                                No imprimir
                            </button>
                        </div>
                    </div>

                    <div v-if="paymentMethod === 'cash'" class="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col items-center justify-center flex-1 animate-in zoom-in-95 duration-300">
                        <span class="text-sm font-bold text-primary/60 mb-1">Cambio a devolver</span>
                        <span class="text-5xl font-black text-primary">${{ changeDue.toFixed(2) }}</span>
                    </div>

                    <div v-else class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40 italic">
                        <CreditCard class="w-16 h-16" />
                        <p class="font-bold">Procesa el pago en el datáfono para continuar</p>
                    </div>

                    <button 
                        @click="handleCheckout"
                        :disabled="isProcessing || (paymentMethod === 'cash' && amountReceived < cartTotal)"
                        class="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 mt-auto"
                    >
                        <Loader2 v-if="isProcessing" class="w-8 h-8 animate-spin" />
                        <span v-else>Confirmar y Pagar</span>
                    </button>
                </div>

                <!-- Col 3: Keypad (Only for Cash) -->
                <div 
                    v-if="paymentMethod === 'cash'"
                    class="lg:w-1/3 p-6 lg:p-8 bg-accent/10 flex flex-col animate-in slide-in-from-right-4 duration-500"
                >
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-black">Teclado Numérico</h3>
                        <button @click="isCheckoutModalOpen = false" class="p-2 hover:bg-accent/50 rounded-xl transition-colors">
                            <X class="w-6 h-6" />
                        </button>
                    </div>

                    <!-- Numeric Display -->
                    <div class="bg-card p-6 rounded-3xl border-2 border-primary shadow-sm flex flex-col items-center mb-6">
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-1">Efectivo Recibido</span>
                        <div class="text-4xl font-black text-primary flex items-center gap-1">
                            <span class="text-xl opacity-40">$</span>
                            {{ amountReceived.toFixed(2) }}
                        </div>
                    </div>

                    <!-- Numeric Keypad -->
                    <div class="grid grid-cols-3 gap-3 flex-1 mb-6">
                        <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" @click="appendDigit(n.toString())" class="aspect-square bg-card rounded-2xl font-black text-2xl shadow-sm hover:bg-primary hover:text-white active:scale-90 transition-all">{{ n }}</button>
                        <button @click="appendDigit('.')" class="aspect-square bg-card rounded-2xl font-black text-2xl shadow-sm hover:bg-accent/50 transition-all">.</button>
                        <button @click="appendDigit('0')" class="aspect-square bg-card rounded-2xl font-black text-2xl shadow-sm hover:bg-primary hover:text-white transition-all">0</button>
                        <button @click="backspace" class="aspect-square bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center hover:bg-destructive hover:text-white active:scale-90 transition-all">
                            <Delete class="w-8 h-8" />
                        </button>
                    </div>

                    <!-- Quick Cash Selection -->
                    <div class="grid grid-cols-4 gap-2">
                        <button @click="quickCash(cartTotal)" class="py-3 bg-primary/20 text-primary rounded-xl font-black text-[10px] hover:bg-primary hover:text-white transition-all">EXACTO</button>
                        <button @click="quickCash(10)" class="py-3 bg-accent/20 rounded-xl font-black text-xs hover:bg-accent/40 transition-all">$10</button>
                        <button @click="quickCash(20)" class="py-3 bg-accent/20 rounded-xl font-black text-xs hover:bg-accent/40 transition-all">$20</button>
                        <button @click="quickCash(50)" class="py-3 bg-accent/20 rounded-xl font-black text-xs hover:bg-accent/40 transition-all">$50</button>
                    </div>
                </div>

                <!-- Close for Card mode (since keypad is hidden) -->
                <button v-if="paymentMethod !== 'cash'" @click="isCheckoutModalOpen = false" class="absolute top-6 right-6 p-3 hover:bg-accent/50 rounded-2xl transition-colors">
                    <X class="w-8 h-8" />
                </button>
            </div>
        </div>

        <!-- Success Modal -->
        <div v-if="isSuccessModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div class="bg-card w-full max-w-xs rounded-[3rem] border border-border shadow-2xl p-10 flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-500">
                <div class="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 class="w-16 h-16" />
                </div>
                <div class="text-center">
                    <h3 class="text-2xl font-black">¡Venta Éxito!</h3>
                    <p class="text-foreground/40 font-bold">Imprimiendo ticket...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
