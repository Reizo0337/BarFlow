<script setup lang="ts">
import { Edit3, Trash2, Search } from 'lucide-vue-next'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useInventoryStore } from '@/stores/inventory'

const inventoryStore = useInventoryStore()

const props = defineProps<{
  products: any[]
}>()

const emit = defineEmits(['edit', 'delete'])

const getStockStatus = (item: any) => {
  if (item.stock === 0) return { label: 'Agotado', variant: 'error' as const }
  if (item.stock <= item.minStock) return { label: 'Stock Bajo', variant: 'warning' as const }
  return { label: 'En Stock', variant: 'success' as const }
}
</script>

<template>
  <div v-if="products.length > 0" class="overflow-x-auto no-scrollbar">
    <table class="w-full text-left border-separate border-spacing-y-4">
      <thead>
        <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
          <th class="px-6 pb-2">Producto e Info</th>
          <th class="px-6 pb-2">Categoría</th>
          <th class="px-6 pb-2 text-center">Nivel de Stock</th>
          <th class="px-6 pb-2 text-right">Valor Unit.</th>
          <th class="px-6 pb-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in products" :key="item.id" class="group hover:-translate-y-1 transition-all duration-300">
          <td class="bg-card group-hover:bg-accent/10 px-6 py-6 rounded-l-[2rem] border-y border-l border-border transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center overflow-hidden font-black text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <img v-if="item.image" :src="inventoryStore.resolveImageUrl(item.image)" class="w-full h-full object-cover" />
                <span v-else>{{ item.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <p class="font-black text-foreground uppercase tracking-tight">{{ item.name }}</p>
                <p class="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">ID: #{{ item.id.toString().padStart(4, '0') }}</p>
              </div>
            </div>
          </td>
          <td class="bg-card group-hover:bg-accent/10 px-6 py-6 border-y border-border transition-colors">
            <BaseBadge variant="outline" class="bg-white group-hover:border-primary/20 group-hover:text-primary">
              {{ item.category?.name || 'Varios' }}
            </BaseBadge>
          </td>
          <td class="bg-card group-hover:bg-accent/10 px-6 py-6 border-y border-border transition-colors text-center">
            <div class="inline-flex flex-col items-center gap-2">
              <div class="flex items-center gap-1.5">
                <span class="text-xl font-black tracking-tighter" :class="getStockStatus(item).variant === 'error' ? 'text-destructive' : getStockStatus(item).variant === 'warning' ? 'text-amber-500' : 'text-emerald-500'">{{ item.stock }}</span>
                <span class="text-[10px] font-bold text-foreground/20 uppercase">{{ item.unit }}</span>
              </div>
              <BaseBadge :variant="getStockStatus(item).variant">
                {{ getStockStatus(item).label }}
              </BaseBadge>
            </div>
          </td>
          <td class="bg-card group-hover:bg-accent/10 px-6 py-6 border-y border-border transition-colors text-right">
            <p class="text-lg font-black tracking-tighter text-foreground/80 group-hover:text-primary transition-colors">${{ Number(item.price).toFixed(2) }}</p>
          </td>
          <td class="bg-card group-hover:bg-accent/10 px-6 py-6 rounded-r-[2rem] border-y border-r border-border transition-colors text-right">
            <div class="flex items-center justify-end gap-2">
              <button @click="emit('edit', item)" class="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/20 hover:bg-primary text-foreground/40 hover:text-white transition-all"><Edit3 class="w-4 h-4" /></button>
              <button @click="emit('delete', item.id)" class="w-10 h-10 flex items-center justify-center rounded-xl bg-destructive/5 hover:bg-destructive text-destructive/40 hover:text-white transition-all"><Trash2 class="w-4 h-4" /></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="flex flex-col items-center justify-center py-32 space-y-6 text-center animate-in zoom-in duration-500">
    <div class="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center text-foreground/10">
      <Search class="w-12 h-12" />
    </div>
    <div class="space-y-2">
      <h3 class="text-xl font-black uppercase tracking-tight">Sin resultados</h3>
      <p class="text-foreground/40 text-sm max-w-xs mx-auto">No hemos encontrado productos que coincidan con tu búsqueda.</p>
    </div>
  </div>
</template>
