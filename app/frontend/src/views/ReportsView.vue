<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  FileText, 
  Download, 
  Calendar, 
  Search, 
  RefreshCcw,
  Printer,
  FileJson,
  FileSpreadsheet
} from 'lucide-vue-next'

import { useInvoicesStore } from '@/stores/invoices'

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
  { name: 'Libro de Ventas', icon: FileSpreadsheet, color: 'text-emerald-500' },
  { name: 'Consumo de Stock', icon: RefreshCcw, color: 'text-amber-500' },
  { name: 'Rendimiento Personal', icon: FileText, color: 'text-primary' },
  { name: 'Histórico de IVA', icon: Printer, color: 'text-rose-500' },
]
</script>

<template>
  <div class="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground uppercase">Centro de Reportes</h1>
        <p class="text-foreground/50 font-bold">Generación de informes exportables e historial del sistema.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Quick Export Actions -->
      <div 
        v-for="report in reportTypes" 
        :key="report.name"
        class="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group"
      >
        <div class="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
          <component :is="report.icon" class="w-6 h-6" :class="report.color" />
        </div>
        <h3 class="font-black text-sm uppercase mb-1">{{ report.name }}</h3>
        <p class="text-[10px] text-foreground/40 font-bold mb-4 uppercase">Descargar reporte mensual</p>
        <div class="flex items-center gap-2">
          <button class="flex-1 py-2 bg-accent/20 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all">PDF</button>
          <button class="flex-1 py-2 bg-accent/20 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all">Excel</button>
        </div>
      </div>
    </div>

    <!-- System Log / Activity -->
    <div class="flex-1 bg-card rounded-[2.5rem] border border-border shadow-xl flex flex-col overflow-hidden">
      <div class="p-6 border-b border-border flex items-center justify-between bg-accent/5">
        <h3 class="font-black text-xl uppercase tracking-widest text-primary">Historial de Actividad</h3>
        <div class="flex items-center gap-4">
          <div class="relative w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input type="text" placeholder="Filtrar eventos..." class="w-full pl-10 pr-4 py-2 bg-accent/20 border-border rounded-xl text-xs outline-none">
          </div>
          <button class="p-2 hover:bg-accent/30 rounded-xl transition-all"><Calendar class="w-5 h-5 text-foreground/40" /></button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-left">
          <thead class="bg-accent/10 sticky top-0">
            <tr>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-foreground/30">Fecha / Hora</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-foreground/30">Evento</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-foreground/30">Empleado</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-foreground/30">Descripción</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-foreground/30 text-right">Monto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="inv in invoicesStore.invoices" :key="inv.id" class="hover:bg-accent/5 transition-colors">
              <td class="px-6 py-4 font-mono text-[10px] font-bold text-foreground/40">{{ formatDate(inv.createdAt) }}</td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                  :class="{
                    'bg-emerald-500/10 text-emerald-500': inv.type === 'out',
                    'bg-destructive/10 text-destructive': inv.type === 'in'
                  }"
                >{{ inv.type === 'out' ? 'Venta' : 'Compra' }}</span>
              </td>
              <td class="px-6 py-4 font-bold text-xs">{{ inv.clientName }}</td>
              <td class="px-6 py-4 text-xs font-medium text-foreground/60">Factura {{ inv.invoiceNumber }}</td>
              <td class="px-6 py-4 text-right font-black text-xs" :class="inv.type === 'in' ? 'text-destructive' : 'text-primary'">
                {{ inv.type === 'in' ? '-' : '' }}${{ Number(inv.amount).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
