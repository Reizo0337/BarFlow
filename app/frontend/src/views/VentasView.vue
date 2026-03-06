<script setup lang="ts">
import { ref, computed } from 'vue'
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
    ReceiptText
} from 'lucide-vue-next'

// --- Mock Data ---
const categories = [
    { id: 'all', name: 'Todos', icon: Grid2X2 },
    { id: 'drinks', name: 'Bebidas', icon: Wine },
    { id: 'coffee', name: 'Cafetería', icon: Coffee },
    { id: 'food', name: 'Comida', icon: Utensils },
]

const products = ref([
    { id: 1, name: 'Cerveza Artesana', price: 4.5, category: 'drinks', image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=300&h=300&fit=crop' },
    { id: 2, name: 'Café Con Leche', price: 2.2, category: 'coffee', image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=300&h=300&fit=crop' },
    { id: 3, name: 'Hamburguesa BarFlow', price: 12.5, category: 'food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop' },
    { id: 4, name: 'Vino Tinto Copa', price: 3.8, category: 'drinks', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop' },
    { id: 5, name: 'Tarta de Queso', price: 5.5, category: 'food', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&h=300&fit=crop' },
    { id: 6, name: 'Zumo de Naranja', price: 3.0, category: 'drinks', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&h=300&fit=crop' },
    { id: 7, name: 'Pizza Prosciutto', price: 10.9, category: 'food', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop' },
    { id: 8, name: 'Coca Cola', price: 2.5, category: 'drinks', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop' },
])

// --- State ---
const selectedCategory = ref('all')
const searchQuery = ref('')
const cart = ref<any[]>([])
const activeTab = ref<'products' | 'cart'>('products')

// --- Computed ---
const filteredProducts = computed(() => {
    return products.value.filter(p => {
        const matchesCategory = selectedCategory.value === 'all' || p.category === selectedCategory.value
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchesCategory && matchesSearch
    })
})

const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const cartCount = computed(() => {
    return cart.value.reduce((count, item) => count + item.quantity, 0)
})

// --- Methods ---
const addToCart = (product: any) => {
    const existing = cart.value.find(item => item.id === product.id)
    if (existing) {
        existing.quantity++
    } else {
        cart.value.push({ ...product, quantity: 1 })
    }
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
</script>

<template>
    <div class="h-full flex flex-col lg:flex-row gap-4 lg:gap-6 animate-in fade-in duration-500 overflow-hidden relative">
        
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
                Mi Pedido
                <span v-if="cartCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-background">
                    {{ cartCount }}
                </span>
            </button>
        </div>

        <!-- Main Sales Area (Left / Center) -->
        <main 
            class="flex-1 flex flex-col min-w-0 space-y-4 lg:space-y-6 overflow-hidden transition-all duration-300"
            :class="[
                activeTab === 'cart' ? 'hidden lg:flex' : 'flex'
            ]"
        >
            
            <!-- Top Controls: Search & Categories -->
            <div class="bg-card p-4 rounded-3xl border border-border shadow-sm space-y-4">
                <div class="relative">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Buscar productos..." 
                        class="w-full pl-12 pr-6 py-3 lg:py-4 bg-accent/30 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm lg:text-base"
                    >
                </div>

                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <button 
                        v-for="cat in categories" 
                        :key="cat.id"
                        @click="selectedCategory = cat.id"
                        class="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl font-bold whitespace-nowrap transition-all touch-manipulation text-sm lg:text-base"
                        :class="selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-accent/30 text-foreground/60 hover:bg-accent/50'"
                    >
                        <component :is="cat.icon" class="w-4 h-4 lg:w-5 lg:h-5" />
                        {{ cat.name }}
                    </button>
                </div>
            </div>

            <!-- Products Grid -->
            <div class="flex-1 overflow-y-auto pr-1 lg:pr-2 no-scrollbar">
                <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 pb-20 lg:pb-10">
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
                            <p class="text-primary font-black text-base lg:text-lg">${{ product.price.toFixed(2) }}</p>
                        </div>
                    </button>
                </div>
            </div>
        </main>

        <!-- Sidebar: Order Review (Right) -->
        <aside 
            class="w-full lg:w-80 xl:w-96 flex flex-col bg-card rounded-3xl border border-border shadow-xl overflow-hidden transition-all duration-300"
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
                        <h2 class="font-black text-lg">Tu Pedido</h2>
                        <p class="text-[10px] lg:text-xs font-bold text-foreground/40 uppercase tracking-wider">Mesa #08</p>
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
                        <p class="text-primary font-black text-xs lg:text-sm">${{ item.price.toFixed(2) }}</p>
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
                        <span>${{ (cartTotal * 0.9).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-foreground/50 font-medium text-xs lg:text-sm">
                        <span>IVA (10%)</span>
                        <span>${{ (cartTotal * 0.1).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-end pt-1 lg:pt-2">
                        <span class="font-bold text-base lg:text-lg">Total</span>
                        <span class="font-black text-2xl lg:text-3xl text-primary">${{ cartTotal.toFixed(2) }}</span>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <button 
                        :disabled="cart.length === 0"
                        class="w-full py-4 lg:py-5 bg-primary text-white rounded-2xl lg:rounded-[1.5rem] font-black text-lg lg:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-3 touch-manipulation"
                    >
                        Cobrar
                        <CircleDollarSign class="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                    
                    <button 
                        class="w-full py-2 lg:py-3 bg-card border border-border text-foreground/60 rounded-xl font-bold hover:bg-accent/30 transition-all flex items-center justify-center gap-2 touch-manipulation text-sm"
                    >
                        <User class="w-4 h-4" />
                        Asignar Cliente
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
