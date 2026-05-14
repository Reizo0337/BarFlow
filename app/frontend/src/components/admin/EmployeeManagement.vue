<script setup lang="ts">
import { Pencil, Trash2, Plus } from 'lucide-vue-next'

const props = defineProps<{
  employees: any[]
}>()

const emit = defineEmits(['edit', 'delete', 'add'])
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="employee in employees" 
        :key="employee.id"
        class="bg-accent/10 border border-border rounded-[2rem] p-6 flex flex-col gap-4 group hover:border-primary/30 hover:bg-accent/20 transition-all"
      >
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-white p-1 shadow-sm overflow-hidden">
            <img :src="employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`" class="w-full h-full object-cover">
          </div>
          <div class="flex-1">
            <h3 class="font-black text-lg">{{ employee.name }}</h3>
            <span 
              class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              :class="[
                employee.role === 'admin' ? 'bg-primary/10 text-primary' : 
                employee.role === 'supervisor' ? 'bg-emerald-500/10 text-emerald-600' : 
                'bg-amber-500/10 text-amber-600'
              ]"
            >
              {{ 
                employee.role === 'admin' ? 'Administrador' : 
                employee.role === 'supervisor' ? 'Encargado' : 
                'Camarero' 
              }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button @click="emit('edit', employee)" class="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all shadow-sm">
            <Pencil class="w-3 h-3" /> Editar
          </button>
          <button @click="emit('delete', employee.id)" class="w-12 flex items-center justify-center py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all shadow-sm">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Add Card -->
      <button 
        @click="emit('add')"
        class="border-4 border-dashed border-border rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-foreground/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group"
      >
        <div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus class="w-8 h-8" />
        </div>
        <span class="font-black uppercase text-sm tracking-widest">Añadir Empleado</span>
      </button>
    </div>
  </div>
</template>
