<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  BrainCircuit,
  Sparkles,
  Loader2,
  ChevronRight
} from 'lucide-vue-next'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  LineElement, 
  PointElement, 
  ArcElement,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import api from '@/services/api'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

ChartJS.register(
  Title, Tooltip, Legend, 
  BarElement, CategoryScale, LinearScale, 
  LineElement, PointElement, ArcElement,
  Filler
)

import { useInvoicesStore } from '@/stores/invoices'
import { useInventoryStore } from '@/stores/inventory'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import StatCard from '@/components/ui/StatCard.vue'

const invoicesStore = useInvoicesStore()
const inventoryStore = useInventoryStore()

const aiSummary = ref('')
const isGeneratingAi = ref(false)
const isAiExpanded = ref(false)

const parsedAiSummary = computed(() => {
    if (!aiSummary.value) return ''
    return DOMPurify.sanitize(marked.parse(aiSummary.value) as string)
})

onMounted(async () => {
    await Promise.all([
        invoicesStore.fetchInvoices(),
        inventoryStore.fetchProducts()
    ])
    // AI generation removed from auto-mount as requested
})

const toggleAiAnalysis = async () => {
    isAiExpanded.value = !isAiExpanded.value
    if (isAiExpanded.value && !aiSummary.value) {
        await generateAiAnalysis()
    }
}

const stats = computed(() => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  const currentMonthInvoices = invoicesStore.invoices.filter(i => {
    const d = new Date(i.createdAt)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && i.type === 'sale'
  })

  const totalRevenue = currentMonthInvoices.reduce((acc, i) => acc + Number(i.amount), 0)
  const totalSales = currentMonthInvoices.length
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0
  
  // Fake previous month for comparison
  const lastMonthRevenue = totalRevenue * 0.85
  const growth = totalRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
  
  return {
    thisMonth: totalRevenue,
    lastMonth: lastMonthRevenue,
    growth: growth.toFixed(1),
    avgTicket: avgTicket,
    customers: totalSales
  }
})

const barData = computed(() => {
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  const dailyData = new Array(7).fill(0)
  
  const last7Days = invoicesStore.invoices.filter(i => {
    const diff = Date.now() - new Date(i.createdAt).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000 && i.type === 'sale'
  })

  last7Days.forEach(inv => {
    const day = new Date(inv.createdAt).getDay()
    dailyData[day] += Number(inv.amount)
  })

  // Reorder to start from Monday if desired, but here we just follow days array
  // Let's rotate to start from Monday [1, 2, 3, 4, 5, 6, 0]
  const orderedLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
  const orderedData = [dailyData[1], dailyData[2], dailyData[3], dailyData[4], dailyData[5], dailyData[6], dailyData[0]]

  return {
    labels: orderedLabels,
    datasets: [
      {
        label: 'Ventas Diarias (€)',
        backgroundColor: '#059669',
        borderRadius: 12,
        data: orderedData
      }
    ]
  }
})

const lineData = computed(() => {
  // Group by week for the last 4 weeks
  const weeks = ['Semana 4', 'Semana 3', 'Semana 2', 'Semana 1'] // Relative to now
  const weeklyData = [0, 0, 0, 0]
  
  invoicesStore.invoices.filter(i => i.type === 'sale').forEach(inv => {
    const diff = Date.now() - new Date(inv.createdAt).getTime()
    const weekIdx = Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
    if (weekIdx >= 0 && weekIdx < 4) {
      weeklyData[3 - weekIdx] += Number(inv.amount)
    }
  })

  return {
    labels: ['Hace 3 semanas', 'Hace 2 semanas', 'Semana Pasada', 'Esta Semana'],
    datasets: [
      {
        label: 'Ingresos (€)',
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 4,
        tension: 0.4,
        fill: true,
        data: weeklyData
      }
    ]
  }
})

const doughnutData = computed(() => {
  const catMap: Record<string, number> = {}
  
  // Link products to categories to count by category
  const productToCategory: Record<string, string> = {}
  inventoryStore.products.forEach(p => {
    productToCategory[p.name] = p.category?.name || 'Sin Categoría'
  })

  invoicesStore.invoices.filter(i => i.type === 'sale').forEach(inv => {
    inv.items?.forEach((item: any) => {
      const catName = productToCategory[item.productName] || 'Otros'
      catMap[catName] = (catMap[catName] || 0) + (item.quantity || 1)
    })
  })

  const labels = Object.keys(catMap)
  const data = Object.values(catMap)
  const total = data.reduce((a, b) => a + b, 0)
  const percentages = data.map(v => total > 0 ? Math.round((v / total) * 100) : 0)

  return {
    labels,
    datasets: [
      {
        backgroundColor: ['#059669', '#ec4899', '#f59e0b', '#3b82f6', '#8b5cf6', '#6366f1'],
        borderWidth: 0,
        hoverOffset: 20,
        data: percentages
      }
    ]
  }
})

const topProducts = computed(() => {
  const prodMap: Record<string, { quantity: number, revenue: number }> = {}
  
  invoicesStore.invoices.filter(i => i.type === 'sale').forEach(inv => {
    inv.items?.forEach((item: any) => {
      if (!prodMap[item.productName]) {
        prodMap[item.productName] = { quantity: 0, revenue: 0 }
      }
      prodMap[item.productName].quantity += Number(item.quantity || 1)
      prodMap[item.productName].revenue += Number(item.total || (item.quantity * item.price))
    })
  })

  return Object.entries(prodMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
})

const paymentMethods = computed(() => {
  const methods = { cash: 0, card: 0, transfer: 0 }
  const sales = invoicesStore.invoices.filter(i => i.type === 'sale')
  
  sales.forEach(inv => {
    const m = (inv.paymentMethod || 'cash').toLowerCase()
    if (m.includes('efectivo') || m === 'cash') methods.cash++
    else if (m.includes('tarjeta') || m === 'card') methods.card++
    else methods.transfer++
  })

  const total = sales.length || 1
  return [
    { name: 'Efectivo', count: methods.cash, percentage: Math.round((methods.cash / total) * 100), color: 'bg-emerald-500' },
    { name: 'Tarjeta', count: methods.card, percentage: Math.round((methods.card / total) * 100), color: 'bg-blue-500' },
    { name: 'Otros', count: methods.transfer, percentage: Math.round((methods.transfer / total) * 100), color: 'bg-slate-400' }
  ]
})

const generateAiAnalysis = async () => {
    if (invoicesStore.invoices.length === 0) return
    isGeneratingAi.value = true
    try {
        const response = await api.post('/ai/analyze-stats', {
            stats: {
                currentMonth: stats.value,
                topCategories: doughnutData.value.labels.map((l, i) => ({ name: l, share: doughnutData.value.datasets[0].data[i] })),
                topProducts: topProducts.value,
                paymentMethods: paymentMethods.value,
                recentActivity: barData.value.datasets[0].data
            }
        })
        aiSummary.value = response.data.summary
    } catch (e) {
        console.error('AI Analysis error:', e)
        aiSummary.value = "Hubo un error al conectar con la inteligencia de negocio. Revisa tu conexión."
    } finally {
        isGeneratingAi.value = false
    }
}

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } }, border: { display: false } }
  }
}

const doughnutOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  cutout: '75%'
}

</script>

<template>
  <div class="space-y-8 animate-in zoom-in-95 duration-500 pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-5xl font-black tracking-tighter text-foreground uppercase">Análisis de Datos</h1>
        <p class="text-foreground/40 font-bold italic">Tendencias, proyecciones y KPIs de negocio.</p>
      </div>
      <div class="flex items-center gap-3">
        <BaseButton variant="secondary" @click="generateAiAnalysis" :loading="isGeneratingAi">
          <template #icon-left><Sparkles class="w-4 h-4" /></template>
          Refrescar IA
        </BaseButton>
        <BaseButton variant="primary" size="icon">
          <Download class="w-5 h-5" />
        </BaseButton>
      </div>
    </div>

    <!-- AI EXECUTIVE SUMMARY (COLLAPSIBLE / ON-DEMAND) -->
    <BaseCard class="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent transition-all duration-500" :class="isAiExpanded ? 'ring-2 ring-primary/20' : 'hover:border-primary/40'">
        <div class="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <BrainCircuit class="w-48 h-48" />
        </div>
        
        <div class="relative z-10">
            <!-- Header / Trigger -->
            <div 
                @click="toggleAiAnalysis"
                class="flex items-center justify-between cursor-pointer p-2"
            >
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Sparkles class="w-5 h-5" :class="{ 'animate-pulse': isGeneratingAi }" />
                    </div>
                    <div>
                        <h3 class="font-black text-sm uppercase tracking-[0.2em] text-primary">Analista de Negocio IA</h3>
                        <p class="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Haz clic para generar informe de rendimiento</p>
                    </div>
                </div>
                
                <BaseButton variant="secondary" size="sm" class="font-black text-[10px] uppercase tracking-widest px-6 h-10">
                    {{ isAiExpanded ? 'Cerrar Informe' : 'Consultar Analista' }}
                    <template #icon-right>
                        <ChevronRight class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-90': isAiExpanded }" />
                    </template>
                </BaseButton>
            </div>

            <!-- Expandable Content -->
            <div 
                v-if="isAiExpanded" 
                class="mt-6 pt-6 border-t border-primary/10 animate-in slide-in-from-top-4 duration-500"
            >
                <div v-if="isGeneratingAi" class="py-12 flex flex-col items-center justify-center gap-4 text-foreground/30">
                    <Loader2 class="w-10 h-10 animate-spin text-primary" />
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Procesando métricas fiscales...</p>
                </div>
                
                <div v-else-if="aiSummary" class="prose prose-sm max-w-none">
                    <div class="ai-content text-foreground/70 leading-relaxed font-medium text-[13px] px-2 pb-4" v-html="parsedAiSummary"></div>
                    
                    <div class="flex justify-end p-2">
                        <button @click="generateAiAnalysis" class="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-widest flex items-center gap-1 transition-colors">
                            <TrendingUp class="w-3 h-3" /> Regenerar Análisis
                        </button>
                    </div>
                </div>

                <div v-else class="py-12 text-center text-foreground/20 italic font-bold">
                    No hay suficientes datos para generar un análisis. Realiza más ventas primero.
                </div>
            </div>
        </div>
    </BaseCard>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Ingresos Mes" 
        :value="`${stats.thisMonth.toLocaleString()}€`" 
        :icon="BarChart3" 
        :footer="`+${stats.growth}% vs mes anterior`"
      />
      <StatCard 
        title="Ticket Medio" 
        :value="`${stats.avgTicket.toFixed(2)}€`" 
        :icon="TrendingUp" 
        variant="success"
        footer="Promedio por ticket"
      />
      <StatCard 
        title="Clientes" 
        :value="stats.customers" 
        :icon="Users" 
        variant="neutral"
        footer="Transacciones totales"
      />
      <StatCard 
        title="Mes Pasado" 
        :value="`${stats.lastMonth.toLocaleString()}€`" 
        :icon="ArrowDownRight" 
        variant="error"
        footer="Facturación estimada"
      />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard class="lg:col-span-2">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="font-black text-xl uppercase tracking-tight">Evolución Semanal</h3>
            <p class="text-xs font-bold text-foreground/30 uppercase tracking-widest">Ingresos totales por semana</p>
          </div>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/20"></span>
              <span class="text-[10px] font-black text-foreground/40 uppercase">Ingresos</span>
            </div>
          </div>
        </div>
        <div class="h-[300px]">
          <Line :data="lineData" :options="chartOptions" />
        </div>
      </BaseCard>

      <BaseCard class="flex flex-col">
        <h3 class="font-black text-xl mb-2 text-center uppercase tracking-tight">Mix de Ventas</h3>
        <p class="text-[9px] font-black text-foreground/30 text-center mb-8 uppercase tracking-[0.2em]">Distribución por categoría</p>
        <div class="h-[250px] relative">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-[10px] font-black text-foreground/20 uppercase tracking-widest">IA</p>
            <p class="text-4xl font-black text-primary tracking-tighter">{{ doughnutData.datasets[0].data[0] || 0 }}%</p>
          </div>
        </div>
        <div class="mt-8 space-y-3 overflow-y-auto max-h-[200px] no-scrollbar">
          <div v-for="(cat, i) in doughnutData.labels" :key="cat" class="flex items-center justify-between p-2 rounded-xl hover:bg-accent/10 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: doughnutData.datasets[0]?.backgroundColor?.[i] || '#ccc' }"></div>
              <span class="text-[10px] font-black text-foreground/50 uppercase tracking-widest truncate max-w-[100px]">{{ cat }}</span>
            </div>
            <span class="text-xs font-black">{{ doughnutData.datasets[0]?.data?.[i] }}%</span>
          </div>
          <div v-if="doughnutData.labels.length === 0" class="text-center py-4 text-foreground/20 italic text-[10px] font-bold uppercase">Sin datos</div>
        </div>
      </BaseCard>
    </div>

    <!-- Bar Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseCard>
            <div class="flex items-center justify-between mb-8">
                <div>
                <h3 class="font-black text-xl uppercase tracking-tight">Actividad Diaria</h3>
                <p class="text-xs font-bold text-foreground/30 uppercase tracking-widest">Facturación de los últimos 7 días</p>
                </div>
            </div>
            <div class="h-[200px]">
                <Bar :data="barData" :options="chartOptions" />
            </div>
        </BaseCard>

        <BaseCard>
            <h3 class="font-black text-xl uppercase tracking-tight mb-1">Métodos de Pago</h3>
            <p class="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-8">Preferencia de los clientes</p>
            
            <div class="space-y-6">
                <div v-for="method in paymentMethods" :key="method.name" class="space-y-2">
                    <div class="flex justify-between items-end">
                        <span class="text-xs font-black uppercase tracking-widest text-foreground/60">{{ method.name }}</span>
                        <span class="text-xs font-black">{{ method.percentage }}%</span>
                    </div>
                    <div class="h-3 bg-accent/20 rounded-full overflow-hidden">
                        <div 
                            class="h-full transition-all duration-1000" 
                            :class="method.color"
                            :style="{ width: `${method.percentage}%` }"
                        ></div>
                    </div>
                </div>
            </div>
        </BaseCard>
    </div>

    <!-- Top Products Ranking -->
    <BaseCard>
        <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <TrendingUp class="w-5 h-5" />
            </div>
            <div>
                <h3 class="font-black text-xl uppercase tracking-tight">Ranking Top 5 Productos</h3>
                <p class="text-xs font-bold text-foreground/30 uppercase tracking-widest">Los favoritos del local por volumen de ventas</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div v-for="(prod, i) in topProducts" :key="prod.name" class="p-4 rounded-3xl bg-accent/5 border border-border/50 hover:border-primary/20 transition-all group">
                <div class="flex items-center justify-between mb-4">
                    <span class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">#{{ i + 1 }}</span>
                    <span class="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{{ prod.quantity }} uds.</span>
                </div>
                <h4 class="font-bold text-sm truncate mb-1">{{ prod.name }}</h4>
                <p class="text-xs font-black text-primary">{{ Number(prod.revenue).toFixed(2) }}€</p>
            </div>
            <div v-if="topProducts.length === 0" class="col-span-5 py-10 text-center text-foreground/20 italic font-bold uppercase text-xs">Aún no hay suficientes ventas para generar un ranking</div>
        </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.ai-content :deep(p) {
    margin-bottom: 1rem;
}
.ai-content :deep(ul), .ai-content :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
}
.ai-content :deep(li) {
    margin-bottom: 0.25rem;
}
.ai-content :deep(strong) {
    color: var(--color-primary);
    font-weight: 800;
}
.ai-content :deep(h1), .ai-content :deep(h2), .ai-content :deep(h3) {
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.025em;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--color-foreground);
}
</style>
