<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
    LayoutGrid, 
    UserCheck, 
    Receipt, 
    CircleDollarSign, 
    Trophy, 
    LogOut, 
    Play, 
    Square,
    Clock,
    ChevronRight
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

// Stores
import { useAuthStore } from '@/stores/auth'
import { useInvoicesStore } from '@/stores/invoices'
import { useShiftsStore } from '@/stores/shifts'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import StatCard from '@/components/ui/StatCard.vue'

const authStore = useAuthStore()
const invoicesStore = useInvoicesStore()
const shiftsStore = useShiftsStore()
const router = useRouter()

// State
const employeeName = computed(() => authStore.user?.name || 'Invitado')
const now = ref(new Date())
let timer: any = null

const hoursWorked = computed(() => {
    let totalMs = Math.max(0, shiftsStore.dailyHours)
    if (shiftsStore.currentShift) {
        const start = new Date(shiftsStore.currentShift.startTime)
        const duration = now.value.getTime() - start.getTime()
        totalMs += Math.max(0, duration)
    }
    const h = Math.floor(totalMs / 3600000).toString().padStart(2, '0')
    const m = Math.floor((totalMs % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((totalMs % 60000) / 1000).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
})

const isOvertime = computed(() => {
    const contracted = authStore.user?.contractedHours || 8
    let totalMs = Math.max(0, shiftsStore.dailyHours)
    if (shiftsStore.currentShift) {
        const start = new Date(shiftsStore.currentShift.startTime)
        const duration = now.value.getTime() - start.getTime()
        totalMs += Math.max(0, duration)
    }
    const workedHours = totalMs / 3600000
    return workedHours >= contracted
})

const handleLogout = async () => {
    if (shiftsStore.currentShift) {
        await shiftsStore.endShift()
    }
    authStore.logout()
    router.push('/portal')
}

onMounted(() => {
    invoicesStore.fetchInvoices()
    shiftsStore.fetchCurrentShift()
    timer = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const startShift = () => shiftsStore.startShift()
const stopShift = () => shiftsStore.endShift()
</script>

<template>
    <div class="space-y-6 md:space-y-10 px-4 py-6 md:p-0 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <!-- Header Section -->
        <header class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div class="space-y-6 w-full lg:w-auto">
                <div class="space-y-2">
                    <h1 class="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
                        Hola, <span class="text-primary">{{ employeeName }}</span>
                    </h1>
                    <p class="text-foreground/40 font-bold text-sm md:text-xl italic">Dashboard operativo en tiempo real.</p>
                </div>
                
                <BaseButton 
                    variant="primary" 
                    size="xl" 
                    class="w-full md:w-fit group" 
                    :disabled="!shiftsStore.currentShift"
                    @click="router.push('/app/ventas')"
                >
                    {{ shiftsStore.currentShift ? 'Abrir Terminal de Ventas' : 'Inicia Jornada para Vender' }}
                    <template #icon-right>
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <ChevronRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </template>
                </BaseButton>
            </div>

            <!-- Session Controls -->
            <BaseCard padding="none" :hover="false" class="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4">
                <div 
                    class="flex items-center gap-4 px-6 py-4 rounded-2xl flex-1 min-w-[220px] transition-all duration-500" 
                    :class="isOvertime ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-accent/20 border border-transparent'"
                >
                    <div class="p-3 rounded-xl" :class="isOvertime ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-primary/10'">
                        <Clock class="w-6 h-6" :class="isOvertime ? 'text-amber-500' : 'text-primary'" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[10px] font-black uppercase tracking-widest" :class="isOvertime ? 'text-amber-500' : 'text-foreground/30'">
                            {{ isOvertime ? 'TIEMPO EXTRA' : 'Jornada Hoy' }}
                        </span>
                        <span class="text-2xl font-black tracking-tighter" :class="isOvertime ? 'text-amber-500' : 'text-foreground'">{{ hoursWorked }}</span>
                    </div>
                </div>
                
                <BaseButton 
                    v-if="!shiftsStore.currentShift"
                    variant="primary"
                    size="lg"
                    class="flex-1 sm:flex-initial"
                    @click="startShift"
                >
                    <template #icon-left><Play class="w-5 h-5 fill-current" /></template>
                    Iniciar Turno
                </BaseButton>
                <BaseButton 
                    v-else
                    variant="destructive"
                    size="lg"
                    class="flex-1 sm:flex-initial"
                    @click="stopShift"
                >
                    <template #icon-left><Square class="w-5 h-5 fill-current" /></template>
                    Finalizar Turno
                </BaseButton>
            </BaseCard>
        </header>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <StatCard title="Mesas Libres" value="12" :icon="LayoutGrid" footer="De un total de 24 mesas" />
            <StatCard title="Mesas Ocupadas" value="8" :icon="UserCheck" footer="65% de ocupación actual" />
            <StatCard title="Ventas Hoy" :value="invoicesStore.todaySalesCount" :icon="Receipt" footer="Tickets procesados" />
            <StatCard title="Recaudación" :value="`$${invoicesStore.todayRevenue.toFixed(2)}`" :icon="CircleDollarSign" variant="success" footer="Ingresos brutos" />
            <StatCard title="Top Empleado" value="Ana García" :icon="Trophy" footer="Rendimiento destacado" />
            
            <button @click="handleLogout" class="w-full text-left touch-manipulation group">
                <StatCard 
                  title="Sesión" 
                  value="Cerrar Acceso" 
                  :icon="LogOut" 
                  variant="error" 
                  footer="Finalizar sesión actual"
                  class="group-hover:border-destructive/30"
                />
            </button>
        </div>
    </div>
</template>
