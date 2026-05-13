<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button'
})

const variants = {
  primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95',
  secondary: 'bg-accent/20 text-foreground hover:bg-accent/30',
  outline: 'bg-transparent border-2 border-border text-foreground hover:border-primary hover:text-primary',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white',
  ghost: 'bg-transparent text-foreground/50 hover:bg-accent/30 hover:text-foreground',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
}

const sizes = {
  sm: 'px-3 py-1.5 text-[10px] rounded-lg',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
  xl: 'px-10 py-5 text-lg rounded-[1.5rem]',
  icon: 'p-3 rounded-xl'
}

const classes = computed(() => {
  return [
    'inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
    variants[props.variant],
    sizes[props.size],
    props.class
  ]
})
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <slot name="icon-left" />
    <template v-if="loading">
      <div class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
    </template>
    <slot v-else />
    <slot name="icon-right" />
  </button>
</template>
