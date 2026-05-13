<script setup lang="ts">
import { ref } from 'vue'
import { X, Plus } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'add'])

const manualProduct = ref({
  name: '',
  price: 0,
  quantity: 1
})

const handleAdd = () => {
  if (!manualProduct.value.name || manualProduct.value.price <= 0) return
  emit('add', { ...manualProduct.value })
  manualProduct.value = { name: '', price: 0, quantity: 1 }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div class="bg-card w-full max-w-md rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div class="p-8 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-black">Producto Manual</h3>
          <button @click="emit('close')" class="p-2 hover:bg-accent/50 rounded-xl transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nombre del producto</label>
            <input v-model="manualProduct.name" type="text" placeholder="Ej: Plato Especial" class="w-full bg-accent/20 border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Precio</label>
              <input v-model.number="manualProduct.price" type="number" step="0.01" class="w-full bg-accent/20 border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Cantidad</label>
              <input v-model.number="manualProduct.quantity" type="number" class="w-full bg-accent/20 border-transparent rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            </div>
          </div>
        </div>

        <button @click="handleAdd" class="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          Añadir al Pedido
        </button>
      </div>
    </div>
  </div>
</template>
