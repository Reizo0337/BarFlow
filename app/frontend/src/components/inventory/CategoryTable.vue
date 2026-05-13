<script setup lang="ts">
import { Tag, Edit3, Trash2 } from 'lucide-vue-next'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps<{
  categories: any[]
  getProductCount: (id: number) => number
}>()

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div v-if="categories.length > 0" class="overflow-x-auto no-scrollbar">
    <table class="w-full text-left border-separate border-spacing-y-4">
      <thead>
        <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
          <th class="px-6 pb-2">Nombre de Categoría</th>
          <th class="px-6 pb-2 text-center">Productos Vinculados</th>
          <th class="px-6 pb-2 text-right">Estado</th>
          <th class="px-6 pb-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.id" class="group hover:-translate-y-1 transition-all duration-300">
          <td class="bg-card group-hover:bg-accent/10 px-6 py-8 rounded-l-[2rem] border-y border-l border-border transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                <Tag class="w-5 h-5" />
              </div>
              <p class="font-black text-lg text-foreground uppercase tracking-tight">{{ cat.name }}</p>
            </div>
          </td>
          <td class="bg-card group-hover:bg-accent/10 px-6 py-8 border-y border-border transition-colors text-center">
            <div class="flex flex-col items-center">
              <span class="text-2xl font-black tracking-tighter text-foreground">{{ getProductCount(cat.id) }}</span>
              <span class="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Items en total</span>
            </div>
          </td>
          <td class="bg-card group-hover:bg-accent/10 px-6 py-8 border-y border-border transition-colors text-right">
            <BaseBadge variant="success">Activo</BaseBadge>
          </td>
          <td class="bg-card group-hover:bg-accent/10 px-6 py-8 rounded-r-[2rem] border-y border-r border-border transition-colors text-right">
            <div class="flex items-center justify-end gap-2">
              <button @click="emit('edit', cat)" class="w-12 h-12 flex items-center justify-center rounded-2xl bg-accent/20 hover:bg-primary text-foreground/40 hover:text-white transition-all shadow-sm"><Edit3 class="w-5 h-5" /></button>
              <button @click="emit('delete', cat.id)" class="w-12 h-12 flex items-center justify-center rounded-2xl bg-destructive/5 hover:bg-destructive text-destructive/40 hover:text-white transition-all shadow-sm"><Trash2 class="w-5 h-5" /></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="flex flex-col items-center justify-center py-32 space-y-6 text-center animate-in zoom-in duration-500">
    <div class="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center text-foreground/10">
      <Tag class="w-12 h-12" />
    </div>
    <div class="space-y-2">
      <h3 class="text-xl font-black uppercase tracking-tight">Sin categorías</h3>
      <p class="text-foreground/40 text-sm max-w-xs mx-auto">No hay categorías que coincidan con tu búsqueda.</p>
    </div>
  </div>
</template>
