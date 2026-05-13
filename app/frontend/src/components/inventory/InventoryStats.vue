<script setup lang="ts">
import { Package, AlertTriangle, Tag, ArrowDownLeft, MoreHorizontal } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'

const props = defineProps<{
  totalProducts: number
  lowStockCount: number
  totalCategories: number
}>()

const stats = [
  { label: 'Productos Totales', value: props.totalProducts, icon: Package, color: 'text-primary', bg: 'bg-primary/5' },
  { label: 'Para Reponer', value: props.lowStockCount, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/5' },
  { label: 'Categorías', value: props.totalCategories, icon: Tag, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
  { label: 'Salidas 30d', value: '842', icon: ArrowDownLeft, color: 'text-destructive', bg: 'bg-destructive/5' }
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <BaseCard v-for="stat in stats" :key="stat.label" padding="none" class="p-8 group overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
      
      <div class="flex items-center justify-between mb-6">
          <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110', stat.bg, stat.color]">
              <component :is="stat.icon" class="w-7 h-7" />
          </div>
          <MoreHorizontal class="w-5 h-5 text-foreground/10" />
      </div>
      <p class="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">{{ stat.label }}</p>
      <p class="text-4xl font-black tracking-tighter text-foreground">{{ stat.value }}</p>
    </BaseCard>
  </div>
</template>
