<script setup lang="ts">
interface Props {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  hover: true,
  padding: 'md'
})

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6 md:p-8',
  lg: 'p-10',
  xl: 'p-12'
}
</script>

<template>
  <div 
    :class="[
      'bg-card border border-border shadow-sm rounded-[2.5rem] transition-all duration-300 overflow-hidden relative',
      hover ? 'hover:shadow-xl hover:-translate-y-1' : '',
      paddings[padding],
      props.class
    ]"
  >
    <slot />
  </div>
</template>
