<template>
    <div 
        class="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 ease-out flex flex-col gap-4 relative overflow-hidden"
    >
        <!-- Background Accent Glow -->
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>

        <div class="flex items-center gap-4 relative z-10">
            <div class="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
                <slot name="icon" />
            </div>
            <div class="flex flex-col">
                <p class="text-sm font-medium text-foreground/50 uppercase tracking-wider">
                    <slot name="title" />
                </p>
                <div class="text-2xl font-black text-foreground tracking-tight">
                    <slot name="content" />
                </div>
            </div>
        </div>
        
        <div v-if="$slots.footer" class="mt-auto pt-4 border-t border-border/50 text-xs font-semibold text-foreground/40 group-hover:text-foreground/60 transition-colors">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup lang="ts">
// No extra props for now to keep it simple and slot-based
</script>

<style scoped>
</style>
