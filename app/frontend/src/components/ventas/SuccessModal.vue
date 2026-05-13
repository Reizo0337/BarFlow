<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div class="bg-card w-full max-w-xs rounded-[3rem] border border-border shadow-2xl p-10 flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-500">
      <div class="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center animate-bounce">
        <CheckCircle2 class="w-16 h-16" />
      </div>
      <div class="text-center">
        <h3 class="text-2xl font-black">¡Venta Éxito!</h3>
        <p class="text-foreground/40 font-bold">Imprimiendo ticket...</p>
      </div>
    </div>
  </div>
</template>
