<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
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

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import StatCard from '@/components/ui/StatCard.vue'

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
    lastMonth: totalRevenue * 0.8,
    growth: 15.2,
    avgTicket: avgTicket,
    customers: totalSales
  }
})

const barData = {
  labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
  datasets: [
    {
      label: 'Ventas esta semana',
      backgroundColor: '#059669', // Primary Emerald
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
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
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
      backgroundColor: ['#059669', '#ec4899', '#f59e0b'],
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
        <h1 class="text-5xl font-black tracking-tighter text-foreground uppercase">Análisis de Datos</h1>
        <p class="text-foreground/40 font-bold italic">Tendencias, proyecciones y KPIs de negocio.</p>
      </div>
      <div class="flex items-center gap-3">
        <BaseButton variant="secondary">
          <template #icon-left><Calendar class="w-4 h-4" /></template>
          Últimos 30 días
        </BaseButton>
        <BaseButton variant="primary" size="icon">
          <Download class="w-5 h-5" />
        </BaseButton>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Ingresos Mes" 
        :value="`$${Number(stats.thisMonth).toLocaleString()}`" 
        :icon="BarChart3" 
        footer="+15.2% vs mes anterior"
      />
      <StatCard 
        title="Ticket Medio" 
        :value="`$${Number(stats.avgTicket).toFixed(2)}`" 
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
        :value="`$${stats.lastMonth.toLocaleString()}`" 
        :icon="ArrowDownRight" 
        variant="error"
        footer="Facturación anterior"
      />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard class="lg:col-span-2">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="font-black text-xl uppercase tracking-tight">Evolución de Ingresos</h3>
            <p class="text-xs font-bold text-foreground/30 uppercase tracking-widest">Comparativa semanal</p>
          </div>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/20"></span>
              <span class="text-[10px] font-black text-foreground/40 uppercase">Actual</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-foreground/10 rounded-full"></span>
              <span class="text-[10px] font-black text-foreground/40 uppercase">Anterior</span>
            </div>
          </div>
        </div>
        <div class="h-[300px]">
          <Line :data="lineData" :options="chartOptions" />
        </div>
      </BaseCard>

      <BaseCard class="flex flex-col">
        <h3 class="font-black text-xl mb-2 text-center uppercase tracking-tight">Mix de Ventas</h3>
        <p class="text-[9px] font-black text-foreground/30 text-center mb-8 uppercase tracking-[0.2em]">Por categoría de producto</p>
        <div class="h-[250px] relative">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Ratio</p>
            <p class="text-4xl font-black text-primary tracking-tighter">60%</p>
          </div>
        </div>
        <div class="mt-8 space-y-3">
          <div v-for="(cat, i) in doughnutData.labels" :key="cat" class="flex items-center justify-between p-2 rounded-xl hover:bg-accent/10 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: doughnutData.datasets[0]?.backgroundColor?.[i] || '#ccc' }"></div>
              <span class="text-xs font-black text-foreground/50 uppercase tracking-widest">{{ cat }}</span>
            </div>
            <span class="text-sm font-black">{{ doughnutData.datasets[0]?.data?.[i] }}%</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Bar Chart -->
    <BaseCard>
      <div class="flex items-center justify-between mb-8">
        <div>
          <h3 class="font-black text-xl uppercase tracking-tight">Actividad Diaria</h3>
          <p class="text-xs font-bold text-foreground/30 uppercase tracking-widest">Picos de demanda semanal</p>
        </div>
      </div>
      <div class="h-[200px]">
        <Bar :data="barData" :options="chartOptions" />
      </div>
    </BaseCard>
  </div>
</template>
