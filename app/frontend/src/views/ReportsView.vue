<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  FileText, 
  Calendar, 
  Search, 
  RefreshCcw,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

import { useInvoicesStore } from '@/stores/invoices'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import AppDialog from '@/components/ui/AppDialog.vue'

// PDF/Export
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const invoicesStore = useInvoicesStore()

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedInvoices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return invoicesStore.invoices.slice(start, end)
})

const totalPages = computed(() => Math.ceil(invoicesStore.invoices.length / itemsPerPage))

const alertDialog = ref({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as any
})

const showAlert = (title: string, message: string, type: string = 'info') => {
    alertDialog.value = { isOpen: true, title, message, type }
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const exportToPDF = (type: string) => {
    const doc = new jsPDF()
    const sales = invoicesStore.invoices.filter(i => i.type === 'sale')
    
    doc.setFontSize(20)
    doc.setTextColor(5, 150, 105) // Emerald 600
    doc.text('BarFlow - ' + type, 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 28)

    if (type === 'Libro de Ventas') {
        const tableData = sales.map(i => [
            formatDate(i.createdAt),
            `${i.series}-${i.invoiceNumber}`,
            i.clientName || 'Cliente Genérico',
            i.taxableBase?.toFixed(2) + '€',
            i.vatAmount?.toFixed(2) + '€',
            i.amount?.toFixed(2) + '€'
        ])
        autoTable(doc, {
            startY: 35,
            head: [['Fecha', 'Factura', 'Cliente', 'Base', 'IVA', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [5, 150, 105] }
        })
    } else if (type === 'Histórico de IVA') {
        const summary: Record<string, any> = {}
        invoicesStore.invoices.forEach(i => {
            const key = `${i.vatRate}%`
            if (!summary[key]) summary[key] = { base: 0, vat: 0, total: 0 }
            summary[key].base += Number(i.taxableBase || 0)
            summary[key].vat += Number(i.vatAmount || 0)
            summary[key].total += Number(i.amount || 0)
        })
        const tableData = Object.entries(summary).map(([rate, vals]) => [
            rate,
            vals.base.toFixed(2) + '€',
            vals.vat.toFixed(2) + '€',
            vals.total.toFixed(2) + '€'
        ])
        autoTable(doc, {
            startY: 35,
            head: [['Tipo IVA', 'Base Imponible', 'Cuota IVA', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] } // Red 600 for tax
        })
    } else {
        showAlert('Reporte en Desarrollo', 'Este tipo de reporte aún no tiene un formato PDF definido.', 'info')
        return
    }

    doc.save(`reporte_${type.toLowerCase().replace(/ /g, '_')}.pdf`)
}

const exportToCSV = (type: string) => {
    let data = []
    let filename = `reporte_${type.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    
    if (type === 'Libro de Ventas') {
        const sales = invoicesStore.invoices.filter(i => i.type === 'sale')
        data = sales.map(i => ({
            Fecha: formatDate(i.createdAt),
            Factura: `${i.series}-${i.invoiceNumber}`,
            Cliente: i.clientName || 'Cliente Genérico',
            NIF: i.fiscalId || '-',
            Base: i.taxableBase?.toFixed(2),
            IVA: i.vatAmount?.toFixed(2),
            Total: i.amount?.toFixed(2),
            Metodo: i.paymentMethod
        }))
    } else if (type === 'Histórico de IVA') {
        const summary: Record<string, any> = {}
        invoicesStore.invoices.forEach(i => {
            const key = `${i.vatRate}%`
            if (!summary[key]) summary[key] = { base: 0, vat: 0, total: 0 }
            summary[key].base += Number(i.taxableBase || 0)
            summary[key].vat += Number(i.vatAmount || 0)
            summary[key].total += Number(i.amount || 0)
        })
        data = Object.entries(summary).map(([rate, vals]) => ({
            Tipo: rate,
            Base_Imponible: vals.base.toFixed(2),
            Cuota_IVA: vals.vat.toFixed(2),
            Total_Facturado: vals.total.toFixed(2)
        }))
    }

    if (data.length === 0) {
        showAlert('Sin Datos', 'No hay registros suficientes para generar este reporte en el periodo actual.', 'warning')
        return
    }

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(',')).join('\n')
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
}

const reportTypes = [
  { name: 'Libro de Ventas', icon: FileSpreadsheet, variant: 'success' as const, description: 'Listado oficial de facturación' },
  { name: 'Consumo de Stock', icon: RefreshCcw, variant: 'warning' as const, description: 'Productos consumidos por periodo' },
  { name: 'Rendimiento Personal', icon: FileText, variant: 'primary' as const, description: 'Ventas por empleado y turno' },
  { name: 'Histórico de IVA', icon: Printer, variant: 'error' as const, description: 'Resumen trimestral de impuestos' },
]

onMounted(() => {
    invoicesStore.fetchInvoices()
})
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
        <p class="text-[10px] text-foreground/20 font-black uppercase tracking-widest mb-6">{{ report.description }}</p>
        
        <div class="flex items-center gap-2 mt-auto">
          <BaseButton variant="secondary" size="sm" class="flex-1" @click="exportToPDF(report.name)">PDF</BaseButton>
          <BaseButton variant="primary" size="sm" class="flex-1 font-black" @click="exportToCSV(report.name)">CSV</BaseButton>
        </div>
      </BaseCard>
    </div>

    <BaseCard padding="none" :hover="false" class="flex-1 flex flex-col overflow-hidden shadow-2xl min-h-[500px]">
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
            <tr v-for="inv in paginatedInvoices" :key="inv.id" class="group hover:bg-accent/5 transition-colors">
              <td class="px-8 py-6 font-mono text-[10px] font-bold text-foreground/30">{{ formatDate(inv.createdAt) }}</td>
              <td class="px-8 py-6">
                <BaseBadge :variant="inv.type === 'sale' ? 'success' : 'error'">
                  {{ inv.type === 'sale' ? 'Venta' : 'Gasto' }}
                </BaseBadge>
              </td>
              <td class="px-8 py-6 font-black text-xs uppercase tracking-tight">{{ inv.clientName || 'Cliente Genérico' }}</td>
              <td class="px-8 py-6 text-xs font-bold text-foreground/40 italic">Factura Ref #{{ inv.invoiceNumber }}</td>
              <td class="px-8 py-6 text-right font-black text-sm" :class="inv.type === 'expense' ? 'text-destructive' : 'text-primary'">
                {{ inv.type === 'expense' ? '-' : '' }}{{ Number(inv.amount).toFixed(2) }}€
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-6 border-t border-border flex items-center justify-between bg-accent/5">
        <p class="text-[10px] font-black uppercase tracking-widest text-foreground/30">
          Mostrando {{ paginatedInvoices.length }} de {{ invoicesStore.invoices.length }} registros
        </p>
        <div class="flex items-center gap-2">
            <BaseButton 
                variant="outline" 
                size="sm" 
                :disabled="currentPage === 1"
                @click="currentPage--"
            >
                <ChevronLeft class="w-4 h-4" />
            </BaseButton>
            <span class="text-xs font-black px-4">PÁGINA {{ currentPage }} DE {{ totalPages || 1 }}</span>
            <BaseButton 
                variant="outline" 
                size="sm" 
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
            >
                <ChevronRight class="w-4 h-4" />
            </BaseButton>
        </div>
      </div>
    </BaseCard>

    <AppDialog 
        :is-open="alertDialog.isOpen" 
        :title="alertDialog.title" 
        :message="alertDialog.message" 
        :type="alertDialog.type"
        @close="alertDialog.isOpen = false"
    />
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

