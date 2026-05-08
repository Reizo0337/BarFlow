<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download
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

ChartJS.register(
  Title, Tooltip, Legend, 
  BarElement, CategoryScale, LinearScale, 
  LineElement, PointElement, ArcElement,
  Filler
)

import { useInvoicesStore } from '@/stores/invoices'

const invoicesStore = useInvoicesStore()

onMounted(() => {
    invoicesStore.fetchInvoices()
})

const stats = computed(() => {
  const totalRevenue = invoicesStore.invoices
    .filter(i => i.type === 'out' && i.status === 'paid')
    .reduce((acc, i) => acc + Number(i.amount), 0)
  
  const totalSales = invoicesStore.invoices.filter(i => i.type === 'out').length
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0
  
  return {
    thisMonth: totalRevenue,
    lastMonth: totalRevenue * 0.8, // Simplified mock for comparison
    growth: 15.2,
    avgTicket: avgTicket,
    customers: totalSales // Simplified: each sale is a customer
  }
})

const barData = {
  labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
  datasets: [
    {
      label: 'Ventas esta semana',
      backgroundColor: '#7c3aed',
      borderRadius: 12,
      data: [840, 920, 780, 1100, 1540, 1980, 1650]
    }
  ]
}

const lineData = {
  labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
  datasets: [
    {
      label: 'Mes Actual',
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      borderWidth: 4,
      tension: 0.4,
      fill: true,
      data: [2800, 3100, 2950, 3600]
    },
    {
      label: 'Mes Pasado',
      borderColor: '#94a3b8',
      borderDash: [5, 5],
      borderWidth: 2,
      tension: 0.4,
      data: [2500, 2700, 2800, 2820]
    }
  ]
}

const doughnutData = {
  labels: ['Bebidas', 'Comida', 'Café'],
  datasets: [
    {
      backgroundColor: ['#7c3aed', '#ec4899', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 20,
      data: [60, 30, 10]
    }
  ]
}

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { weight: 'bold' } }, border: { display: false } }
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
  <div class="space-y-8 animate-in zoom-in-95 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-foreground text-glow">Estadísticas de Venta</h1>
        <p class="text-foreground/50 font-medium italic">Análisis detallado de rendimiento y tendencias.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-5 py-2.5 bg-accent/20 rounded-2xl font-bold hover:bg-accent/40 transition-all text-sm">
          <Calendar class="w-4 h-4" />
          Últimos 30 días
        </button>
        <button class="p-2.5 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10">
          <Download class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <BarChart3 class="w-6 h-6" />
          </div>
          <div class="flex items-center gap-1 text-emerald-500 text-xs font-black bg-emerald-500/10 px-2 py-1 rounded-lg">
            <ArrowUpRight class="w-3 h-3" />
            {{ stats.growth }}%
          </div>
        </div>
        <p class="text-xs font-black text-foreground/30 uppercase tracking-widest">Ventas este Mes</p>
        <p class="text-3xl font-black">${{ Number(stats.thisMonth).toLocaleString() }}</p>
      </div>

      <div class="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
            <TrendingUp class="w-6 h-6" />
          </div>
        </div>
        <p class="text-xs font-black text-foreground/30 uppercase tracking-widest">Ticket Medio</p>
        <p class="text-3xl font-black">${{ Number(stats.avgTicket).toFixed(2) }}</p>
      </div>

      <div class="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
            <Users class="w-6 h-6" />
          </div>
        </div>
        <p class="text-xs font-black text-foreground/30 uppercase tracking-widest">Clientes Totales</p>
        <p class="text-3xl font-black">{{ stats.customers }}</p>
      </div>

      <div class="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
            <ArrowDownRight class="w-6 h-6" />
          </div>
        </div>
        <p class="text-xs font-black text-foreground/30 uppercase tracking-widest">Mes Pasado</p>
        <p class="text-3xl font-black text-foreground/60">${{ stats.lastMonth.toLocaleString() }}</p>
      </div>
    </div>

    <!-- Charts Row 1: Line Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border border-border shadow-xl">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="font-black text-xl">Ingresos vs Periodo Anterior</h3>
            <p class="text-sm font-medium text-foreground/30 italic">Comparativa de facturación por semanas</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-primary rounded-full"></span>
              <span class="text-xs font-bold text-foreground/60">Mes Actual</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-foreground/30 rounded-full"></span>
              <span class="text-xs font-bold text-foreground/60">Mes Pasado</span>
            </div>
          </div>
        </div>
        <div class="h-[300px]">
          <Line :data="lineData" :options="chartOptions" />
        </div>
      </div>

      <div class="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl">
        <h3 class="font-black text-xl mb-2 text-center">Distribución Ventas</h3>
        <p class="text-xs font-medium text-foreground/30 text-center mb-8 uppercase tracking-widest">Por categoría de producto</p>
        <div class="h-[250px] relative">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-[10px] font-black text-foreground/30 uppercase">Mix</p>
            <p class="text-3xl font-black text-primary">Top</p>
          </div>
        </div>
        <div class="mt-6 space-y-2">
          <div v-for="(cat, i) in doughnutData.labels" :key="cat" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: doughnutData.datasets[0]?.backgroundColor?.[i] || '#ccc' }"></div>
              <span class="text-sm font-bold text-foreground/60">{{ cat }}</span>
            </div>
            <span class="text-sm font-black">{{ doughnutData.datasets[0]?.data?.[i] }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row 2: Bar Chart -->
    <div class="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h3 class="font-black text-xl">Ventas por Día (Semana Actual)</h3>
          <p class="text-sm font-medium text-foreground/30">Picos de actividad diaria</p>
        </div>
      </div>
      <div class="h-[200px]">
        <Bar :data="barData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-glow {
  text-shadow: 0 0 40px rgba(124, 58, 237, 0.2);
}
</style>
