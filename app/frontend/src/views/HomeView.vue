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
import { RouterLink } from 'vue-router'
import Card from '@/components/layout/Card.vue'

import { useAuthStore } from '@/stores/auth'
import { useInvoicesStore } from '@/stores/invoices'
import { useShiftsStore } from '@/stores/shifts'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const invoicesStore = useInvoicesStore()
const shiftsStore = useShiftsStore()
const router = useRouter()

// State
const employeeName = computed(() => authStore.user?.name || 'Invitado')
const now = ref(new Date())
let timer: any = null

const hoursWorked = computed(() => {
    // totalMs is past shifts today in ms
    let totalMs = Math.max(0, shiftsStore.dailyHours);
    
    // If there is an active shift, add its current duration
    if (shiftsStore.currentShift) {
        const start = new Date(shiftsStore.currentShift.startTime)
        const duration = now.value.getTime() - start.getTime()
        totalMs += Math.max(0, duration)
    }

    const hours = Math.floor(totalMs / (1000 * 60 * 60))
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000)
    
    const hh = hours.toString().padStart(2, '0')
    const mm = minutes.toString().padStart(2, '0')
    const ss = seconds.toString().padStart(2, '0')
    
    return `${hh}:${mm}:${ss}`
})

const handleLogout = () => {
    authStore.logout()
    router.push('/portal')
}

onMounted(() => {
    invoicesStore.fetchInvoices()
    shiftsStore.fetchCurrentShift()
    timer = setInterval(() => {
        now.value = new Date()
    }, 1000)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const startShift = async () => { await shiftsStore.startShift() }
const stopShift = async () => { await shiftsStore.endShift() }
</script>

<template>
    <div class="space-y-6 md:space-y-10 px-4 py-6 md:p-0 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <!-- Header Section: Responsive Greeting & Stats -->
        <header class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div class="space-y-4 w-full lg:w-auto">
                <div class="space-y-1">
                    <h1 class="text-3xl md:text-5xl font-black tracking-tight text-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                        Hola, <span class="text-primary">{{ employeeName }}</span>
                    </h1>
                    <p class="text-foreground/50 font-medium text-sm md:text-lg">¡Bienvenido de nuevo! Aquí tienes el resumen de hoy.</p>
                </div>
                
                <!-- Main Action Button (TOUCH-FIRST - LARGE BUTTON) -->
                <div class="w-full md:w-fit">
                    <RouterLink 
                        to="/app/ventas" 
                        class="flex items-center justify-between w-full md:w-fit gap-6 pl-8 pr-6 py-5 bg-primary text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all shadow-2xl shadow-primary/30 active:scale-95 group overflow-hidden relative"
                        :class="{ 'opacity-50 grayscale cursor-not-allowed pointer-events-none': !shiftsStore.currentShift }"
                    >
                        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span class="relative z-10">{{ shiftsStore.currentShift ? 'Portal de Ventas' : 'Portal de Ventas (Inicia Jornada)' }}</span>
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                            <ChevronRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </RouterLink>
                </div>
            </div>

            <!-- Session Controls Card -->
            <div class="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-card p-3 rounded-3xl border border-border shadow-soft">
                <div class="flex items-center gap-4 px-5 py-4 bg-accent/30 rounded-2xl flex-1">
                    <div class="p-3 bg-primary/10 rounded-xl">
                        <Clock class="w-6 h-6 text-primary" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold uppercase text-foreground/40 leading-none">Hoy</span>
                        <span class="text-xl font-black text-foreground">{{ hoursWorked }}</span>
                    </div>
                </div>
                
                <div class="flex flex-1 sm:flex-initial">
                    <button 
                        v-if="!shiftsStore.currentShift"
                        @click="startShift"
                        class="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 touch-manipulation"
                    >
                        <Play class="w-5 h-5 fill-current" />
                        Iniciar Jornada
                    </button>
                    <button 
                        v-else
                        @click="stopShift"
                        class="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-destructive text-white rounded-2xl font-black text-lg hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20 active:scale-95 touch-manipulation"
                    >
                        <Square class="w-5 h-5 fill-current" />
                        Finalizar Jornada
                    </button>
                </div>
            </div>
        </header>

        <!-- Stats Grid (Responsive Columns) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Card class="min-h-[140px]">
                <template #icon><LayoutGrid class="w-7 h-7" /></template>
                <template #title>Mesas Libres</template>
                <template #content>12</template>
                <template #footer>De un total de 24 mesas</template>
            </Card>

            <Card class="min-h-[140px]">
                <template #icon><UserCheck class="w-7 h-7" /></template>
                <template #title>Mesas Ocupadas</template>
                <template #content>8</template>
                <template #footer>65% de ocupación</template>
            </Card>

            <Card class="min-h-[140px]">
                <template #icon><Receipt class="w-7 h-7" /></template>
                <template #title>Ventas de Hoy</template>
                <template #content>{{ invoicesStore.todaySalesCount }}</template>
                <template #footer>Transacciones procesadas hoy</template>
            </Card>

            <Card class="min-h-[140px]">
                <template #icon><CircleDollarSign class="w-7 h-7" /></template>
                <template #title>Recaudación Hoy</template>
                <template #content>${{ invoicesStore.todayRevenue.toFixed(2) }}</template>
                <template #footer>Ingresos brutos del día</template>
            </Card>

            <Card class="min-h-[140px]">
                <template #icon><Trophy class="w-7 h-7" /></template>
                <template #title>Top Empleado</template>
                <template #content>Ana García</template>
                <template #footer>18 servicios completados</template>
            </Card>

            <!-- Action Card for Exit -->
            <button @click="handleLogout" class="w-full text-left group touch-manipulation">
                <Card class="group-hover:border-destructive/30 group-hover:shadow-lg group-hover:shadow-destructive/5 transition-all min-h-[140px]">
                    <template #icon>
                        <LogOut class="w-7 h-7 text-destructive group-hover:scale-110 transition-transform" />
                    </template>
                    <template #title>Turno</template>
                    <template #content>
                        <span class="text-destructive group-hover:underline decoration-2">Salir de Turno</span>
                    </template>
                    <template #footer>Finaliza tu sesión actual</template>
                </Card>
            </button>
        </div>
    </div>
</template>

<style scoped>
.shadow-soft {
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
}
</style>
