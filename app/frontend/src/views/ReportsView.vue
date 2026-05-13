<script setup lang="ts">
import { onMounted } from 'vue'
import { 
  FileText, 
  Calendar, 
  Search, 
  RefreshCcw,
  Printer,
  FileSpreadsheet
} from 'lucide-vue-next'

import { useInvoicesStore } from '@/stores/invoices'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const invoicesStore = useInvoicesStore()

onMounted(() => {
    invoicesStore.fetchInvoices()
})

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const reportTypes = [
  { name: 'Libro de Ventas', icon: FileSpreadsheet, variant: 'success' as const },
  { name: 'Consumo de Stock', icon: RefreshCcw, variant: 'warning' as const },
  { name: 'Rendimiento Personal', icon: FileText, variant: 'primary' as const },
  { name: 'Histórico de IVA', icon: Printer, variant: 'error' as const },
]
</script>

<template>
  <div class="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <header>
      <h1 class="text-5xl font-black tracking-tighter text-foreground uppercase">Centro de Reportes</h1>
      <p class="text-foreground/40 font-bold text-lg italic">Inteligencia de negocio y auditoría del sistema.</p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <BaseCard 
        v-for="report in reportTypes" 
        :key="report.name"
        class="group flex flex-col"
      >
        <div :class="[
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform',
          report.variant === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
          report.variant === 'warning' ? 'bg-amber-500/10 text-amber-500' :
          report.variant === 'error' ? 'bg-destructive/10 text-destructive' :
          'bg-primary/10 text-primary'
        ]">
          <component :is="report.icon" class="w-7 h-7" />
        </div>
        <h3 class="font-black text-sm uppercase tracking-wider mb-1">{{ report.name }}</h3>
        <p class="text-[10px] text-foreground/20 font-black uppercase tracking-widest mb-6">Generar reporte mensual</p>
        
        <div class="flex items-center gap-2 mt-auto">
          <BaseButton variant="secondary" size="sm" class="flex-1">PDF</BaseButton>
          <BaseButton variant="secondary" size="sm" class="flex-1">EXCEL</BaseButton>
        </div>
      </BaseCard>
    </div>

    <BaseCard padding="none" :hover="false" class="flex-1 flex flex-col overflow-hidden shadow-2xl">
      <div class="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between bg-accent/5 gap-4">
        <h3 class="font-black text-xl uppercase tracking-widest text-primary">Historial de Actividad</h3>
        <div class="flex items-center gap-4">
          <BaseInput 
            placeholder="Filtrar eventos..." 
            :icon="Search"
            class="md:w-72"
          />
          <BaseButton variant="outline" size="icon">
            <Calendar class="w-5 h-5" />
          </BaseButton>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto no-scrollbar">
        <table class="w-full text-left">
          <thead class="bg-accent/10 sticky top-0 z-10">
            <tr>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/30">Fecha / Hora</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/30">Evento</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/30">Responsable</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/30">Descripción</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/30 text-right">Monto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/50">
            <tr v-for="inv in invoicesStore.invoices" :key="inv.id" class="group hover:bg-accent/5 transition-colors">
              <td class="px-8 py-6 font-mono text-[10px] font-bold text-foreground/30">{{ formatDate(inv.createdAt) }}</td>
              <td class="px-8 py-6">
                <BaseBadge :variant="inv.type === 'out' ? 'success' : 'error'">
                  {{ inv.type === 'out' ? 'Venta' : 'Compra' }}
                </BaseBadge>
              </td>
              <td class="px-8 py-6 font-black text-xs uppercase tracking-tight">{{ inv.clientName }}</td>
              <td class="px-8 py-6 text-xs font-bold text-foreground/40 italic">Factura Ref #{{ inv.invoiceNumber }}</td>
              <td class="px-8 py-6 text-right font-black text-sm" :class="inv.type === 'in' ? 'text-destructive' : 'text-primary'">
                {{ inv.type === 'in' ? '-' : '' }}${{ Number(inv.amount).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
