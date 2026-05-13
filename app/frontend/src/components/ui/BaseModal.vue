<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true
})

const emit = defineEmits(['close'])

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]'
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div 
      :class="[
        'bg-card w-full rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300',
        sizes[size]
      ]"
    >
      <div class="p-8 lg:p-10 space-y-8">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-3xl font-black tracking-tight text-foreground uppercase">{{ title }}</h3>
            <p v-if="description" class="text-foreground/40 font-bold mt-1">{{ description }}</p>
          </div>
          <button v-if="showClose" @click="emit('close')" class="p-3 hover:bg-accent/50 rounded-2xl transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-6">
          <slot />
        </div>

        <div v-if="$slots.footer" class="pt-4 flex gap-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>
