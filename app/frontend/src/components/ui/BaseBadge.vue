<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral'
})

const variants = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  neutral: 'bg-accent/20 text-foreground/60 border-border',
  outline: 'bg-transparent border-border text-foreground/40'
}
</script>

<template>
  <span 
    :class="[
      'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all',
      variants[variant],
      props.class
    ]"
  >
    <slot />
  </span>
</template>
