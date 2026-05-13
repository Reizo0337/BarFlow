<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Receipt, TrendingUp, TrendingDown, Eye, Download, Calendar, Loader2 } from 'lucide-vue-next'
import { useInvoicesStore } from '@/stores/invoices'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import StatCard from '@/components/ui/StatCard.vue'

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
    
  return { net: incomes - expenses, incomes, expenses }
})

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    default: return 'neutral'
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
        <h1 class="text-5xl font-black tracking-tighter text-foreground uppercase">Facturación</h1>
        <p class="text-foreground/40 font-bold italic">Control de flujos de caja y obligaciones fiscales.</p>
      </div>
      
      <div class="flex items-center gap-2 p-2 bg-accent/20 rounded-3xl w-fit">
        <BaseButton 
          :variant="activeType === 'all' ? 'primary' : 'ghost'" 
          size="sm" 
          @click="activeType = 'all'"
        >Todas</BaseButton>
        <BaseButton 
          :variant="activeType === 'out' ? 'primary' : 'ghost'" 
          size="sm" 
          @click="activeType = 'out'"
        >
          <template #icon-left><TrendingUp class="w-4 h-4" /></template>
          Ventas
        </BaseButton>
        <BaseButton 
          :variant="activeType === 'in' ? 'primary' : 'ghost'" 
          size="sm" 
          @click="activeType = 'in'"
        >
          <template #icon-left><TrendingDown class="w-4 h-4" /></template>
          Compras
        </BaseButton>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Balance General" 
        :value="`$${stats.net.toFixed(2)}`" 
        :icon="Receipt" 
        footer="Neto del periodo actual"
      />
      <BaseCard class="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/10 p-8 space-y-4">
        <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Ingresos</p>
        <p class="text-4xl font-black text-emerald-500 tracking-tighter">${{ stats.incomes.toFixed(2) }}</p>
        <div class="h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 transition-all duration-1000" :style="{ width: '100%' }"></div>
        </div>
      </BaseCard>
      <BaseCard class="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/10 p-8 space-y-4">
        <p class="text-[10px] font-black text-destructive uppercase tracking-widest">Total Gastos</p>
        <p class="text-4xl font-black text-destructive tracking-tighter">${{ stats.expenses.toFixed(2) }}</p>
        <div class="h-1.5 bg-destructive/10 rounded-full overflow-hidden">
          <div class="h-full bg-destructive transition-all duration-1000" :style="{ width: '100%' }"></div>
        </div>
      </BaseCard>
    </div>

    <!-- Invoice List -->
    <div class="space-y-4">
      <div v-if="invoicesStore.isLoading" class="flex flex-col items-center justify-center py-20 text-foreground/20 italic space-y-4">
        <Loader2 class="w-10 h-10 animate-spin" />
        <p>Sincronizando con el servidor...</p>
      </div>

      <div v-else v-for="inv in filteredInvoices" :key="inv.id" class="group relative">
        <BaseCard padding="none" class="p-5 flex flex-wrap items-center justify-between gap-6 hover:border-primary/50">
          <div class="flex items-center gap-4">
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center" 
              :class="inv.type === 'in' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'"
            >
              <TrendingDown v-if="inv.type === 'in'" class="w-7 h-7" />
              <TrendingUp v-else class="w-7 h-7" />
            </div>
            <div>
              <p class="text-[10px] font-black text-foreground/20 font-mono tracking-widest uppercase">REF: {{ inv.invoiceNumber }}</p>
              <h4 class="font-black text-lg text-foreground uppercase tracking-tight">{{ inv.clientName }}</h4>
            </div>
          </div>

          <div class="hidden md:flex items-center gap-10">
            <div class="flex flex-col">
              <span class="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Fecha Registro</span>
              <div class="flex items-center gap-2 text-foreground/50 font-bold text-xs uppercase">
                <Calendar class="w-3 h-3" /> {{ formatDate(inv.createdAt) }}
              </div>
            </div>
            <BaseBadge :variant="getStatusVariant(inv.status)">
              {{ getStatusLabel(inv.status) }}
            </BaseBadge>
          </div>

          <div class="flex items-center gap-6 ml-auto">
            <p class="text-3xl font-black tracking-tighter" :class="inv.type === 'in' ? 'text-foreground/40' : 'text-primary'">
              {{ inv.type === 'in' ? '-' : '' }}${{ Number(inv.amount).toFixed(2) }}
            </p>
            <div class="flex items-center gap-2">
              <BaseButton variant="secondary" size="icon"><Eye class="w-5 h-5" /></BaseButton>
              <BaseButton variant="secondary" size="icon"><Download class="w-5 h-5" /></BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
