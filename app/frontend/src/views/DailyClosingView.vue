<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
    ReceiptText, 
    ArrowLeft, 
    Calculator, 
    TrendingUp, 
    AlertCircle, 
    History,
    CheckCircle2,
    DollarSign,
    CreditCard,
    ChevronRight,
    Loader2
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import AppDialog from '@/components/ui/AppDialog.vue'
import { useUIStore } from '@/stores/ui'

import { generateClosingPDF } from '@/utils/pdf-generator'

const router = useRouter()
const uiStore = useUIStore()

// State
const stats = ref<any>(null)
const history = ref<any[]>([])
const actualCash = ref<number>(0)
const isLoading = ref(true)
const isClosing = ref(false)
const activeTab = ref<'current' | 'history'>('current')
const companySettings = ref<any>({})

// Dialog State
const dialog = ref({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as any,
    onConfirm: () => {}
})

const fetchSettings = async () => {
    try {
        const response = await api.get('/companies/settings')
        companySettings.value = response.data
    } catch (e) { console.error(e) }
}

const fetchStats = async () => {
    try {
        const response = await api.get('/invoices/daily-closing/stats')
        stats.value = response.data
        actualCash.value = response.data.cashTotal
    } catch (e) {
        console.error(e)
    }
}

const fetchHistory = async () => {
    try {
        const response = await api.get('/invoices/daily-closing/history')
        history.value = response.data
    } catch (e) {
        console.error(e)
    }
}

onMounted(async () => {
    // LAYOUT FOR CIERRE: Sidebar collapsed, Header visible (No Zen)
    uiStore.toggleZenMode(false)
    uiStore.isSidebarCollapsed = true
    
    await Promise.all([fetchStats(), fetchHistory(), fetchSettings()])
    isLoading.value = false
})

onUnmounted(() => {
    uiStore.isSidebarCollapsed = false
})

const discrepancy = computed(() => {
    if (!stats.value) return 0
    return actualCash.value - stats.value.cashTotal
})

const downloadClosingTicket = (closing: any, type: 'simple' | 'detailed') => {
    generateClosingPDF(closing, companySettings.value, type)
}

const handleClosing = async () => {
    dialog.value = {
        isOpen: true,
        title: 'Confirmar Cierre de Caja (Z)',
        message: 'Esta acción cerrará el día fiscal y generará el reporte Z inalterable. ¿Deseas continuar?',
        type: 'confirm',
        onConfirm: async () => {
            isClosing.value = true
            try {
                const response = await api.post('/invoices/daily-closing', { actualCash: actualCash.value })
                
                // Refresh local state immediately
                await Promise.all([fetchStats(), fetchHistory()])
                
                dialog.value.isOpen = false
                
                // Automatically download simple ticket
                downloadClosingTicket(response.data, 'simple')

                // Show success
                setTimeout(() => {
                    dialog.value = {
                        isOpen: true,
                        title: 'Cierre Completado',
                        message: 'El cierre de caja se ha realizado correctamente. Se ha descargado el ticket Z.',
                        type: 'success',
                        onConfirm: () => {
                            dialog.value.isOpen = false
                            activeTab.value = 'history' // Switch to history to show the new record
                        }
                    }
                }, 500)
            } catch (error: any) {
                dialog.value = {
                    isOpen: true,
                    title: 'Error',
                    message: error.response?.data?.message || 'Error al cerrar caja',
                    type: 'error',
                    onConfirm: () => dialog.value.isOpen = false
                }
            } finally {
                isClosing.value = false
            }
        }
    }
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <h1 class="text-4xl font-black tracking-tighter">Cierre de <span class="text-primary">Caja</span></h1>
                </div>
                <p class="text-foreground/40 font-bold ml-0">Gestión fiscal y operativa del arqueo diario.</p>
            </div>

            <div class="flex p-1 bg-accent/10 rounded-2xl">
                <button 
                    @click="activeTab = 'current'" 
                    class="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                    :class="activeTab === 'current' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
                >
                    Arqueo Actual
                </button>
                <button 
                    @click="activeTab = 'history'" 
                    class="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                    :class="activeTab === 'history' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
                >
                    Historial (Z)
                </button>
            </div>
        </div>

        <div v-if="isLoading" class="h-96 flex items-center justify-center">
            <Loader2 class="w-12 h-12 text-primary animate-spin" />
        </div>

        <div v-else-if="activeTab === 'current'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left: Stats & Counting -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Totals Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-card p-6 rounded-[2rem] border border-border space-y-2">
                        <div class="flex items-center gap-3 text-emerald-500">
                            <DollarSign class="w-5 h-5" />
                            <span class="text-[10px] font-black uppercase tracking-widest">Efectivo Esperado</span>
                        </div>
                        <p class="text-3xl font-black tracking-tighter">€{{ stats?.cashTotal.toFixed(2) }}</p>
                    </div>
                    <div class="bg-card p-6 rounded-[2rem] border border-border space-y-2">
                        <div class="flex items-center gap-3 text-blue-500">
                            <CreditCard class="w-5 h-5" />
                            <span class="text-[10px] font-black uppercase tracking-widest">Tarjeta Esperado</span>
                        </div>
                        <p class="text-3xl font-black tracking-tighter">€{{ stats?.cardTotal.toFixed(2) }}</p>
                    </div>
                    <div class="bg-primary/5 p-6 rounded-[2rem] border border-primary/20 space-y-2">
                        <div class="flex items-center gap-3 text-primary">
                            <TrendingUp class="w-5 h-5" />
                            <span class="text-[10px] font-black uppercase tracking-widest">Total Ventas</span>
                        </div>
                        <p class="text-3xl font-black tracking-tighter">€{{ stats?.totalAmount.toFixed(2) }}</p>
                    </div>
                </div>

                <!-- Arqueo (Drawer Count) -->
                <div class="bg-card rounded-[2.5rem] border-2 border-border p-8 lg:p-12 space-y-10 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <Calculator class="w-40 h-40" />
                    </div>
                    
                    <div class="space-y-4">
                        <h2 class="text-2xl font-black tracking-tight">Arqueo de Efectivo</h2>
                        <p class="text-foreground/40 font-medium">Introduce la cantidad exacta de efectivo que hay en el cajón.</p>
                    </div>

                    <div class="flex flex-col md:flex-row items-end gap-8">
                        <div class="flex-1 space-y-4 w-full">
                            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4">Efectivo Real en Caja</label>
                            <div class="relative group">
                                <span class="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-foreground/20 group-focus-within:text-primary/40 transition-colors">€</span>
                                <input 
                                    v-model.number="actualCash" 
                                    type="number" 
                                    class="w-full bg-accent/20 border-2 border-transparent focus:border-primary/50 focus:bg-card rounded-3xl py-8 pl-16 pr-8 text-5xl font-black tracking-tighter transition-all outline-none"
                                    placeholder="0.00"
                                >
                            </div>
                        </div>

                        <div class="flex flex-col items-end gap-2 min-w-[200px]">
                            <span class="text-[10px] font-black uppercase tracking-widest" :class="discrepancy === 0 ? 'text-emerald-500' : 'text-destructive'">
                                {{ discrepancy === 0 ? 'Caja Cuadrada' : 'Descuadre' }}
                            </span>
                            <div 
                                class="text-4xl font-black tracking-tighter"
                                :class="discrepancy === 0 ? 'text-emerald-500' : 'text-destructive'"
                            >
                                {{ discrepancy > 0 ? '+' : '' }}{{ discrepancy.toFixed(2) }}€
                            </div>
                        </div>
                    </div>

                    <div v-if="Math.abs(discrepancy) > 0" class="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 animate-in slide-in-from-top-2">
                        <AlertCircle class="w-5 h-5 flex-shrink-0" />
                        <p class="text-sm font-bold">Existe un descuadre de {{ discrepancy.toFixed(2) }}€. Esto quedará registrado en el reporte Z.</p>
                    </div>
                </div>
            </div>

            <!-- Right: Insights & Action -->
            <div class="space-y-8">
                <!-- Action Card -->
                <div class="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 space-y-6">
                    <div class="space-y-2">
                        <h3 class="text-2xl font-black tracking-tight">Finalizar Día</h3>
                        <p class="text-white/70 text-sm font-medium">Una vez realizado el cierre, no podrás emitir más facturas con fecha de hoy.</p>
                    </div>
                    
                    <button 
                        @click="handleClosing"
                        :disabled="isClosing || !stats?.totalSalesCount"
                        class="w-full bg-white text-primary py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        <Loader2 v-if="isClosing" class="w-6 h-6 animate-spin" />
                        <template v-else>
                            {{ !stats?.totalSalesCount ? 'Sin Ventas Pendientes' : 'Realizar Cierre Z' }} 
                            <CheckCircle2 v-if="stats?.totalSalesCount" class="w-6 h-6" />
                        </template>
                    </button>
                </div>

                <!-- Statistics -->
                <div class="bg-card rounded-[2.5rem] border border-border p-6 space-y-6">
                    <div class="flex items-center gap-3">
                        <TrendingUp class="w-5 h-5 text-primary" />
                        <h3 class="font-black text-sm uppercase tracking-widest">Desglose Fiscal (IVA)</h3>
                    </div>

                    <div class="space-y-3">
                        <div v-for="(amount, rate) in stats?.vatBreakdown" :key="rate" class="flex items-center justify-between p-3 bg-accent/10 rounded-xl">
                            <span class="font-bold text-sm">Cuota {{ rate }}</span>
                            <span class="font-black text-primary">€{{ amount.toFixed(2) }}</span>
                        </div>
                        <div v-if="!stats?.vatBreakdown || Object.keys(stats.vatBreakdown).length === 0" class="py-4 text-center text-foreground/30 italic text-sm">
                            Sin datos de impuestos
                        </div>
                    </div>

                    <div class="flex items-center gap-3 pt-4 border-t border-border">
                        <ReceiptText class="w-5 h-5 text-primary" />
                        <h3 class="font-black text-sm uppercase tracking-widest">Top Productos Hoy</h3>
                    </div>

                    <div class="space-y-4">
                        <div v-if="stats?.topProducts?.length" class="space-y-3">
                            <div v-for="(p, i) in stats.topProducts" :key="i" class="flex items-center justify-between p-3 bg-accent/10 rounded-xl">
                                <div class="flex flex-col">
                                    <span class="font-bold text-sm">{{ p.name }}</span>
                                    <span class="text-[10px] text-foreground/40 font-black uppercase">{{ p.quantity }} unidades</span>
                                </div>
                                <span class="font-black text-primary">€{{ p.total.toFixed(2) }}</span>
                            </div>
                        </div>
                        <div v-else class="py-6 text-center text-foreground/30 italic text-sm">
                            No hay ventas registradas
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- History Tab -->
        <div v-else class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="close in history" :key="close.id" class="bg-card border border-border rounded-3xl p-6 hover:border-primary/30 transition-all group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <History class="w-6 h-6" />
                        </div>
                        <span class="px-3 py-1 bg-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest text-foreground/40">Z #{{ close.closingNumber }}</span>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <p class="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Fecha y Hora</p>
                            <p class="font-bold">{{ new Date(close.timestamp).toLocaleString() }}</p>
                        </div>
                        
                        <div class="flex justify-between border-t border-border pt-4">
                            <div>
                                <p class="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Total</p>
                                <p class="text-xl font-black text-primary">€{{ close.totalAmount.toFixed(2) }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Usuario</p>
                                <p class="font-bold">{{ close.user?.name }}</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pt-2">
                            <button 
                                @click="downloadClosingTicket(close, 'simple')"
                                class="flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/20 text-primary font-bold text-[10px] uppercase hover:bg-primary/5 transition-all"
                            >
                                Ticket Simple
                            </button>
                            <button 
                                @click="downloadClosingTicket(close, 'detailed')"
                                class="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary font-bold text-[10px] uppercase hover:bg-primary hover:text-white transition-all"
                            >
                                Detallado
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- AppDialog -->
        <AppDialog 
            :is-open="dialog.isOpen"
            :title="dialog.title"
            :message="dialog.message"
            :type="dialog.type"
            :is-loading="isClosing"
            @confirm="dialog.onConfirm"
            @close="dialog.isOpen = false"
            @cancel="dialog.isOpen = false"
        />
    </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type=number] {
    -moz-appearance: textfield;
}
</style>
