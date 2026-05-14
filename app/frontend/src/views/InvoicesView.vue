<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Receipt, TrendingUp, TrendingDown, Eye, Download, Calendar, Loader2, Printer, Search, Filter, FileJson, X, CreditCard, Banknote, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useInvoicesStore } from '@/stores/invoices'
import api from '@/services/api'
import { generateTicketPDF } from '@/utils/pdf-generator'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import StatCard from '@/components/ui/StatCard.vue'
import AppDialog from '@/components/ui/AppDialog.vue'

const invoicesStore = useInvoicesStore()
const activeType = ref<'all' | 'in' | 'out'>('all')
const searchQuery = ref('')
const isDetailModalOpen = ref(false)
const selectedInvoice = ref<any>(null)
const isLoadingDetail = ref(false)
const companySettings = ref<any>({})

// --- Expense Creation ---
const isExpenseModalOpen = ref(false)
const isSubmittingExpense = ref(false)
const expenseForm = ref({
    amount: 0,
    source: '',
    paymentMethod: 'cash',
    vatRate: 10
})

onMounted(async () => {
  invoicesStore.fetchInvoices()
  try {
    const res = await api.get('/companies/settings')
    companySettings.value = res.data
  } catch (e) { console.error(e) }
})

const filteredInvoices = computed(() => {
  let list = invoicesStore.invoices
  if (activeType.value !== 'all') {
    list = list.filter(inv => inv.type === activeType.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(q) || 
        inv.clientName.toLowerCase().includes(q)
    )
  }
  return list
})

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredInvoices.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / itemsPerPage))

const stats = computed(() => {
  const incomes = invoicesStore.invoices
    .filter(i => i.type === 'out' && i.fiscalStatus !== 'cancelled')
    .reduce((acc, i) => acc + Number(i.amount), 0)
  
  const expenses = invoicesStore.invoices
    .filter(i => i.type === 'in')
    .reduce((acc, i) => acc + Number(i.amount), 0)
    
  return { net: incomes - expenses, incomes, expenses }
})

const viewDetail = async (invoice: any) => {
    selectedInvoice.value = invoice
    isDetailModalOpen.value = true
    isLoadingDetail.value = true
    try {
        const response = await api.get(`/invoices/${invoice.id}`)
        selectedInvoice.value = response.data
    } catch (error) {
        console.error('Error fetching invoice details:', error)
    } finally {
        isLoadingDetail.value = false
    }
}

const reprintTicket = async (invoice: any) => {
    let invToPrint = invoice
    if (!invoice.items) {
        try {
            const res = await api.get(`/invoices/${invoice.id}`)
            invToPrint = res.data
        } catch (e) { return }
    }
    
    // Map items back to the format the PDF generator expects
    const cartFormat = invToPrint.items.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price
    }))

    await generateTicketPDF(invToPrint, cartFormat, companySettings.value, companySettings.value.currency || '€')
}

const exportVerifactu = async (invoice: any) => {
  try {
    const response = await api.get(`/invoices/${invoice.id}/verifactu`)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `Verifactu_${invoice.series}_${invoice.invoiceNumber}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  } catch (error) {
    console.error('Error exporting Verifactu:', error)
  }
}

const handleCreateExpense = async () => {
    if (!expenseForm.value.amount || !expenseForm.value.source) return
    
    isSubmittingExpense.value = true
    try {
        await api.post('/invoices', {
            type: 'in',
            amount: expenseForm.value.amount,
            clientName: expenseForm.value.source,
            paymentMethod: expenseForm.value.paymentMethod,
            vatRate: expenseForm.value.vatRate,
            series: 'G', // G for Gastos
            terminalId: 'MANUAL'
        })
        
        isExpenseModalOpen.value = false
        expenseForm.value = { amount: 0, source: '', paymentMethod: 'cash', vatRate: 10 }
        
        // Refresh list
        await invoicesStore.fetchInvoices()
    } catch (error) {
        console.error('Error creating expense:', error)
    } finally {
        isSubmittingExpense.value = false
    }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'normal': return 'success'
    case 'rectificative': return 'warning'
    case 'cancelled': return 'error'
    default: return 'neutral'
  }
}
</script>

<template>
  <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div>
        <h1 class="text-5xl font-black tracking-tighter text-foreground uppercase leading-none">Facturación</h1>
        <p class="text-foreground/40 font-bold italic mt-2">Registros inalterables y cumplimiento fiscal AEAT.</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-4">
        <BaseButton variant="destructive" @click="isExpenseModalOpen = true">
            <template #icon-left><TrendingDown class="w-5 h-5" /></template>
            Registrar Gasto
        </BaseButton>
        <div class="h-10 w-px bg-border hidden lg:block"></div>
        <div class="flex flex-wrap items-center gap-3">
            <div class="relative">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Buscar por nº o cliente..." 
                    class="pl-11 pr-4 py-3 bg-accent/10 border border-border rounded-2xl text-sm font-bold focus:border-primary transition-all w-64"
                />
            </div>
            <div class="flex items-center gap-1 p-1.5 bg-accent/10 rounded-2xl border border-border">
                <button 
                    v-for="type in (['all', 'out', 'in'] as const)" 
                    :key="type"
                    @click="activeType = type"
                    class="px-4 py-2 rounded-xl text-xs font-black uppercase transition-all"
                    :class="activeType === type ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-foreground'"
                >
                    {{ type === 'all' ? 'Todo' : type === 'out' ? 'Ventas' : 'Compras' }}
                </button>
            </div>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Balance Fiscal" 
        :value="`${companySettings.currency || '€'}${stats.net.toFixed(2)}`" 
        :icon="Receipt" 
        footer="Resultado neto (Ingresos - Gastos)"
        class="border-primary/20 bg-primary/5"
      />
      <BaseCard class="bg-card border-border p-8 space-y-4">
        <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ingresos Totales</p>
            <TrendingUp class="w-4 h-4 text-emerald-500" />
        </div>
        <p class="text-4xl font-black text-foreground tracking-tighter">{{ companySettings.currency || '€' }}{{ stats.incomes.toFixed(2) }}</p>
        <div class="h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500" :style="{ width: '100%' }"></div>
        </div>
      </BaseCard>
      <BaseCard class="bg-card border-border p-8 space-y-4">
        <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-destructive uppercase tracking-widest">Gastos Totales</p>
            <TrendingDown class="w-4 h-4 text-destructive" />
        </div>
        <p class="text-4xl font-black text-foreground tracking-tighter">{{ companySettings.currency || '€' }}{{ stats.expenses.toFixed(2) }}</p>
        <div class="h-1.5 bg-destructive/10 rounded-full overflow-hidden">
          <div class="h-full bg-destructive" :style="{ width: '100%' }"></div>
        </div>
      </BaseCard>
    </div>

    <!-- Invoice List Table -->
    <div class="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-accent/5 border-b border-border">
                        <th class="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/30">Referencia / Tipo</th>
                        <th class="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/30">Cliente</th>
                        <th class="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 text-center">Estado Fiscal</th>
                        <th class="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 text-right">Importe</th>
                        <th class="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border/50">
                    <tr v-if="invoicesStore.isLoading">
                        <td colspan="5" class="p-20 text-center">
                            <div class="flex flex-col items-center gap-4 text-foreground/20 italic">
                                <Loader2 class="w-10 h-10 animate-spin" />
                                <p>Cargando registros fiscales...</p>
                            </div>
                        </td>
                    </tr>
                    <tr v-else-if="filteredInvoices.length === 0">
                        <td colspan="5" class="p-20 text-center text-foreground/20 italic font-bold">
                            No se encontraron registros para esta selección.
                        </td>
                    </tr>
                    <tr v-for="inv in paginatedInvoices" :key="inv.id" class="hover:bg-accent/5 transition-colors group">
                        <td class="p-6">
                            <div class="flex items-center gap-4">
                                <div 
                                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                                    :class="inv.type === 'in' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'"
                                >
                                    <TrendingDown v-if="inv.type === 'in'" class="w-5 h-5" />
                                    <TrendingUp v-else class="w-5 h-5" />
                                </div>
                                <div>
                                    <p class="text-sm font-black text-foreground tracking-tight">{{ inv.series }}-{{ inv.invoiceNumber }}</p>
                                    <p class="text-[10px] font-bold text-foreground/30 uppercase">{{ formatDate(inv.createdAt) }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="p-6">
                            <span class="font-bold text-sm text-foreground/70">{{ inv.clientName }}</span>
                        </td>
                        <td class="p-6 text-center">
                            <BaseBadge :variant="getStatusVariant(inv.fiscalStatus)">
                                {{ inv.fiscalStatus === 'normal' ? 'Emitida' : inv.fiscalStatus === 'rectificative' ? 'Rectificativa' : 'Anulada' }}
                            </BaseBadge>
                        </td>
                        <td class="p-6 text-right">
                            <p class="text-xl font-black tracking-tighter" :class="inv.type === 'in' ? 'text-foreground/40' : 'text-primary'">
                                {{ inv.type === 'in' ? '-' : '' }}{{ companySettings.currency || '€' }}{{ Number(inv.amount).toFixed(2) }}
                            </p>
                        </td>
                        <td class="p-6 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <BaseButton variant="ghost" size="icon" @click="viewDetail(inv)" title="Ver Detalle"><Eye class="w-5 h-5" /></BaseButton>
                                <BaseButton variant="ghost" size="icon" @click="reprintTicket(inv)" title="Reimprimir Ticket"><Printer class="w-5 h-5" /></BaseButton>
                                <BaseButton variant="ghost" size="icon" @click="exportVerifactu(inv)" title="Exportar Veri*Factu JSON"><Download class="w-5 h-5 text-primary" /></BaseButton>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Footer -->
        <div class="p-6 border-t border-border flex flex-col md:flex-row items-center justify-between bg-accent/5 gap-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                Mostrando {{ paginatedInvoices.length }} de {{ filteredInvoices.length }} registros
            </p>
            <div class="flex items-center gap-3">
                <BaseButton 
                    variant="outline" 
                    size="sm" 
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                >
                    <ChevronLeft class="w-4 h-4" />
                </BaseButton>
                
                <div class="flex items-center gap-1">
                    <span class="text-xs font-black px-2 uppercase tracking-tighter">PÁGINA {{ currentPage }} / {{ totalPages || 1 }}</span>
                </div>

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
    </div>

    <!-- DETAIL MODAL -->
    <div v-if="isDetailModalOpen" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-card w-full max-w-2xl rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <!-- Modal Header -->
            <div class="p-8 border-b border-border flex items-center justify-between bg-accent/5">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <Receipt class="w-6 h-6" />
                    </div>
                    <div>
                        <h3 class="text-2xl font-black tracking-tighter">Factura {{ selectedInvoice.series }}-{{ selectedInvoice.invoiceNumber }}</h3>
                        <p class="text-xs font-bold text-foreground/40">{{ formatDate(selectedInvoice.createdAt) }}</p>
                    </div>
                </div>
                <button @click="isDetailModalOpen = false" class="p-3 hover:bg-accent/50 rounded-2xl transition-colors">
                    <X class="w-6 h-6" />
                </button>
            </div>

            <!-- Modal Content -->
            <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <!-- Status & Fiscal Info -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-5 bg-accent/10 rounded-3xl border border-border">
                        <p class="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-2">Estado Fiscal AEAT</p>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span class="font-black text-sm uppercase">Veri*Factu Compliant</span>
                        </div>
                    </div>
                    <div class="p-5 bg-accent/10 rounded-3xl border border-border">
                        <p class="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-2">Método de Pago</p>
                        <div class="flex items-center gap-2 font-black text-sm uppercase">
                            <CreditCard v-if="selectedInvoice.paymentMethod === 'card'" class="w-4 h-4 text-primary" />
                            <Banknote v-else class="w-4 h-4 text-emerald-500" />
                            {{ selectedInvoice.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo' }}
                        </div>
                    </div>
                </div>

                <!-- Product List -->
                <div class="space-y-4">
                    <h5 class="text-xs font-black uppercase tracking-[0.2em] text-foreground/20 ml-2">Detalle de Líneas</h5>
                    <div v-if="isLoadingDetail" class="py-10 flex flex-col items-center gap-3 text-foreground/20 italic">
                        <Loader2 class="w-8 h-8 animate-spin" />
                        <span>Recuperando detalles inalterables...</span>
                    </div>
                    <div v-else class="space-y-2">
                        <div v-for="item in selectedInvoice.items" :key="item.id" class="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                            <div class="flex flex-col">
                                <span class="font-bold text-sm">{{ item.productName }}</span>
                                <span class="text-[10px] font-bold text-foreground/30">{{ item.quantity }} ud. x {{ companySettings.currency || '€' }}{{ item.price.toFixed(2) }}</span>
                            </div>
                            <span class="font-black text-base">{{ companySettings.currency || '€' }}{{ item.total.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Fiscal Summary -->
                <div class="p-6 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col gap-3">
                    <div class="flex justify-between text-xs font-bold opacity-70 uppercase tracking-widest">
                        <span>Base Imponible</span>
                        <span>{{ companySettings.currency || '€' }}{{ Number(selectedInvoice.taxableBase).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-xs font-bold opacity-70 uppercase tracking-widest">
                        <span>IVA ({{ selectedInvoice.vatRate }}%)</span>
                        <span>{{ companySettings.currency || '€' }}{{ Number(selectedInvoice.vatAmount).toFixed(2) }}</span>
                    </div>
                    <div class="h-px bg-white/20 my-1"></div>
                    <div class="flex justify-between items-end">
                        <span class="text-sm font-black uppercase tracking-widest">Total Facturado</span>
                        <span class="text-3xl font-black">{{ companySettings.currency || '€' }}{{ Number(selectedInvoice.amount).toFixed(2) }}</span>
                    </div>
                </div>

                <!-- Hash Chain Info -->
                <div class="p-6 bg-accent/20 rounded-3xl border-2 border-dashed border-border flex flex-col items-center text-center gap-2">
                    <FileJson class="w-8 h-8 text-foreground/20" />
                    <p class="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-tight">Huella Digital (Encadenamiento Veri*Factu)</p>
                    <code class="text-[9px] font-bold text-primary break-all bg-card px-3 py-1.5 rounded-lg border border-border">{{ selectedInvoice.hash || 'NO_HASH_AVAILABLE' }}</code>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 bg-accent/5 border-t border-border flex gap-3">
                <BaseButton variant="secondary" class="flex-1 py-4" @click="reprintTicket(selectedInvoice)">
                    <template #icon-left><Printer class="w-5 h-5" /></template>
                    Reimprimir Ticket
                </BaseButton>
                <BaseButton variant="primary" class="flex-1 py-4" @click="exportVerifactu(selectedInvoice)">
                    <template #icon-left><Download class="w-5 h-5" /></template>
                    Exportar JSON AEAT
                </BaseButton>
            </div>
        </div>
    </div>

    <!-- EXPENSE REGISTRATION MODAL -->
    <div v-if="isExpenseModalOpen" class="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-card w-full max-w-lg rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-8 border-b border-border bg-destructive/5 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center">
                        <TrendingDown class="w-6 h-6" />
                    </div>
                    <div>
                        <h3 class="text-2xl font-black tracking-tighter">Registrar Gasto</h3>
                        <p class="text-xs font-bold text-foreground/40">Añadir factura de compra o gasto manual.</p>
                    </div>
                </div>
                <button @click="isExpenseModalOpen = false" class="p-3 hover:bg-destructive/10 rounded-2xl transition-colors">
                    <X class="w-6 h-6" />
                </button>
            </div>

            <div class="p-8 space-y-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4">Origen / Proveedor / Concepto</label>
                    <input 
                        v-model="expenseForm.source"
                        type="text" 
                        placeholder="Ej: Factura Hielo, Alquiler, Luz..." 
                        class="w-full bg-accent/10 border-2 border-transparent focus:border-destructive/50 focus:bg-card rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4">Importe Total</label>
                        <div class="relative">
                            <span class="absolute left-6 top-1/2 -translate-y-1/2 font-black text-foreground/20">€</span>
                            <input 
                                v-model.number="expenseForm.amount"
                                type="number" 
                                placeholder="0.00" 
                                class="w-full bg-accent/10 border-2 border-transparent focus:border-destructive/50 focus:bg-card rounded-2xl pl-10 pr-6 py-4 font-black outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4">IVA (%)</label>
                        <select 
                            v-model.number="expenseForm.vatRate"
                            class="w-full bg-accent/10 border-2 border-transparent focus:border-destructive/50 focus:bg-card rounded-2xl px-6 py-4 font-black outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option :value="0">0% (Exento)</option>
                            <option :value="4">4% (Superreducido)</option>
                            <option :value="10">10% (Reducido)</option>
                            <option :value="21">21% (General)</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4">Método de Pago</label>
                    <div class="grid grid-cols-2 gap-3">
                        <button 
                            @click="expenseForm.paymentMethod = 'cash'"
                            :class="expenseForm.paymentMethod === 'cash' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-accent/10 text-foreground/40'"
                            class="py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Banknote class="w-4 h-4" /> Efectivo
                        </button>
                        <button 
                            @click="expenseForm.paymentMethod = 'card'"
                            :class="expenseForm.paymentMethod === 'card' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-accent/10 text-foreground/40'"
                            class="py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <CreditCard class="w-4 h-4" /> Tarjeta
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-6 bg-accent/5 border-t border-border">
                <BaseButton 
                    variant="destructive" 
                    class="w-full py-5 text-lg" 
                    :loading="isSubmittingExpense"
                    @click="handleCreateExpense"
                >
                    Guardar Gasto
                </BaseButton>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
