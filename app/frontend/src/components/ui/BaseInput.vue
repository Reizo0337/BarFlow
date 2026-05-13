<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: string
  icon?: any
  error?: string
  hint?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

const emit = defineEmits(['update:modelValue'])

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="space-y-2 w-full">
    <label v-if="label" class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 ml-1">
      {{ label }}
    </label>
    <div class="relative group">
      <div v-if="icon" class="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors">
        <component :is="icon" class="w-5 h-5" />
      </div>
      <input 
        :type="type" 
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder"
        :class="[
          'w-full bg-accent/10 border border-transparent rounded-2xl py-4 px-6 font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/20 transition-all shadow-sm placeholder:text-foreground/20',
          icon ? 'pl-16' : '',
          error ? 'border-destructive/50 ring-destructive/10' : '',
          props.class
        ]"
      >
    </div>
    <p v-if="error" class="text-[10px] text-destructive font-bold px-2">{{ error }}</p>
    <p v-else-if="hint" class="text-[10px] text-foreground/30 font-bold px-2 italic">{{ hint }}</p>
  </div>
</template>
