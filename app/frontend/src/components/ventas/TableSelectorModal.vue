<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  selectedTable: string
  tables: string[]
  pendingOrders: Record<string, any[]>
}>()

const emit = defineEmits(['close', 'select'])
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div class="bg-card w-full max-w-5xl rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div class="p-8 lg:p-12 space-y-8">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-3xl font-black">Seleccionar Mesa</h3>
            <p class="text-foreground/40 font-bold">Selecciona una mesa para gestionar su pedido</p>
          </div>
          <button @click="emit('close')" class="p-3 hover:bg-accent/50 rounded-2xl transition-colors">
            <X class="w-8 h-8" />
          </button>
        </div>

        <div class="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar p-1">
          <button 
            v-for="table in tables" 
            :key="table"
            @click="emit('select', table)"
            class="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2"
            :class="[
              selectedTable === table ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-accent/20 border-transparent hover:border-primary/30',
              pendingOrders[table]?.length > 0 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-card' : ''
            ]"
          >
            <span class="text-[10px] font-black opacity-40 uppercase">Mesa</span>
            <span class="text-xl font-black">{{ table }}</span>
            <div v-if="pendingOrders[table]?.length > 0" class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
