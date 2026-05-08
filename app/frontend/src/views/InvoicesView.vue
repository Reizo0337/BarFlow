<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Receipt, TrendingUp, TrendingDown, FileText, Download, Eye, Calendar, User, Loader2 } from 'lucide-vue-next'
import { useInvoicesStore } from '@/stores/invoices'

const invoicesStore = useInvoicesStore()
const activeType = ref<'all' | 'in' | 'out'>('all')

onMounted(() => {
  invoicesStore.fetchInvoices()
})

const filteredInvoices = computed(() => {
  if (activeType.value === 'all') return invoicesStore.invoices
  return invoicesStore.invoices.filter(inv => inv.type === activeType.value)
})

const stats = computed(() => {
  const incomes = invoicesStore.invoices
    .filter(i => i.type === 'out' && i.status === 'paid')
    .reduce((acc, i) => acc + Number(i.amount), 0)
  
  const expenses = invoicesStore.invoices
    .filter(i => i.type === 'in')
    .reduce((acc, i) => acc + Number(i.amount), 0)
    
  return {
    net: incomes - expenses,
    incomes,
    expenses
  }
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-emerald-500/10 text-emerald-500'
    case 'pending': return 'bg-amber-500/10 text-amber-500'
    case 'cancelled': return 'bg-destructive/10 text-destructive'
    default: return 'bg-accent/20 text-foreground/40'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid': return 'Pagada'
    case 'pending': return 'Pendiente'
    case 'cancelled': return 'Cancelada'
    default: return status
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-foreground">Facturación</h1>
        <p class="text-foreground/50 font-medium">Registro de ingresos y gastos de la actividad.</p>
      </div>
      <div class="flex items-center gap-2 p-1 bg-accent/20 rounded-2xl w-fit">
        <button 
          @click="activeType = 'all'"
          class="px-6 py-2 rounded-xl font-bold transition-all"
          :class="activeType === 'all' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'"
        >Todas</button>
        <button 
          @click="activeType = 'out'"
          class="px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
          :class="activeType === 'out' ? 'bg-card text-emerald-500 shadow-sm' : 'text-foreground/40'"
        >
          <TrendingUp class="w-4 h-4" /> Venta
        </button>
        <button 
          @click="activeType = 'in'"
          class="px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
          :class="activeType === 'in' ? 'bg-card text-destructive shadow-sm' : 'text-foreground/40'"
        >
          <TrendingDown class="w-4 h-4" /> Compra
        </button>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-card p-8 rounded-[2rem] border border-border shadow-xl space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Receipt class="w-7 h-7" />
          </div>
          <h3 class="font-black text-xl">Balance General</h3>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-black text-foreground/30 uppercase tracking-widest text-center">Neto del Mes</p>
          <p class="text-5xl font-black text-center text-primary">${{ stats.net.toFixed(2) }}</p>
        </div>
      </div>

      <div class="bg-gradient-to-br from-emerald-500/20 to-transparent p-6 rounded-3xl border border-emerald-500/10 space-y-3">
        <p class="text-xs font-black text-emerald-500/60 uppercase tracking-widest">Total Ingresos</p>
        <p class="text-3xl font-black text-emerald-500">${{ stats.incomes.toFixed(2) }}</p>
        <div class="h-1 bg-accent/20 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 w-[100%] transition-all" :style="{ width: `${stats.incomes > 0 ? 100 : 0}%` }"></div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-destructive/20 to-transparent p-6 rounded-3xl border border-destructive/10 space-y-3">
        <p class="text-xs font-black text-destructive/60 uppercase tracking-widest">Total Gastos</p>
        <p class="text-3xl font-black text-destructive">${{ stats.expenses.toFixed(2) }}</p>
        <div class="h-1 bg-accent/20 rounded-full overflow-hidden">
          <div class="h-full bg-destructive w-[100%] transition-all" :style="{ width: `${stats.expenses > 0 ? 100 : 0}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Invoice List -->
    <div class="space-y-4">
      <div v-if="invoicesStore.isLoading" class="flex flex-col items-center justify-center py-20 text-foreground/20 italic space-y-4">
        <Loader2 class="w-10 h-10 animate-spin" />
        <p>Cargando facturas...</p>
      </div>
      <div v-else v-for="inv in filteredInvoices" :key="inv.id" class="group relative">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div class="relative bg-card p-5 rounded-3xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-6 hover:border-primary/30 transition-all">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center" :class="inv.type === 'in' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'">
              <TrendingDown v-if="inv.type === 'in'" class="w-6 h-6" />
              <TrendingUp v-else class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs font-black text-foreground/30 font-mono">{{ inv.invoiceNumber }}</p>
              <h4 class="font-bold text-foreground">{{ inv.clientName }}</h4>
            </div>
          </div>

          <div class="hidden sm:flex items-center gap-8">
            <div class="flex items-center gap-2 text-foreground/40 font-medium text-sm">
              <Calendar class="w-4 h-4" />
              {{ formatDate(inv.createdAt) }}
            </div>
            <div class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider" :class="getStatusColor(inv.status)">
              {{ getStatusLabel(inv.status) }}
            </div>
          </div>

          <div class="flex items-center gap-6 ml-auto">
            <p class="text-2xl font-black" :class="inv.type === 'in' ? 'text-foreground' : 'text-primary'">
              {{ inv.type === 'in' ? '-' : '' }}${{ Number(inv.amount).toFixed(2) }}
            </p>
            <div class="flex items-center gap-2">
              <button class="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Eye class="w-5 h-5" />
              </button>
              <button class="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Download class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
