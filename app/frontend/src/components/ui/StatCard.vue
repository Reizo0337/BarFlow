<script setup lang="ts">
import BaseCard from './BaseCard.vue'

interface Props {
  title: string
  value: string | number
  icon?: any
  footer?: string
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

const iconVariants = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-amber-500/10 text-amber-500',
  error: 'bg-destructive/10 text-destructive',
  neutral: 'bg-accent/20 text-foreground/40'
}
</script>

<template>
  <BaseCard padding="none" class="p-6 md:p-8 group h-full">
    <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>

    <div class="flex items-center gap-4 relative z-10">
      <div v-if="icon" :class="['p-3 rounded-xl transition-transform duration-300 group-hover:scale-110', iconVariants[variant]]">
        <component :is="icon" class="w-7 h-7" />
      </div>
      <div class="flex flex-col">
        <p class="text-xs font-black text-foreground/30 uppercase tracking-[0.2em]">
          {{ title }}
        </p>
        <div class="text-3xl font-black text-foreground tracking-tighter">
          {{ value }}
        </div>
      </div>
    </div>
    
    <div v-if="footer" class="mt-6 pt-4 border-t border-border/50 text-[10px] font-black uppercase tracking-widest text-foreground/20 group-hover:text-foreground/40 transition-colors">
      {{ footer }}
    </div>
  </BaseCard>
</template>
