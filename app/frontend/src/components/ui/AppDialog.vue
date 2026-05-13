<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
    AlertCircle, 
    CheckCircle2, 
    Info, 
    HelpCircle, 
    X,
    Loader2
} from 'lucide-vue-next'

interface DialogProps {
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error' | 'confirm'
    confirmText?: string
    cancelText?: string
    isOpen: boolean
    isLoading?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
    type: 'info',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    isOpen: false,
    isLoading: false
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
    if (props.isLoading) return
    emit('confirm')
}

const handleCancel = () => {
    if (props.isLoading) return
    emit('cancel')
}

// Close on Escape
const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen && !props.isLoading) {
        emit('close')
    }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const icons = {
    info: { component: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    success: { component: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    warning: { component: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    error: { component: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    confirm: { component: HelpCircle, color: 'text-primary', bg: 'bg-primary/10' }
}

const currentIcon = icons[props.type]
</script>

<template>
    <Transition name="fade">
        <div v-if="isOpen" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity" @click="!isLoading && emit('close')"></div>

            <!-- Modal -->
            <div class="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200">
                <div class="p-8">
                    <!-- Icon & Header -->
                    <div class="flex flex-col items-center text-center space-y-4">
                        <div :class="['p-4 rounded-2xl', currentIcon.bg]">
                            <component :is="currentIcon.component" :class="['w-8 h-8', currentIcon.color]" />
                        </div>
                        
                        <div class="space-y-2">
                            <h3 class="text-xl font-black tracking-tight text-foreground">{{ title }}</h3>
                            <p class="text-foreground/50 font-medium leading-relaxed">{{ message }}</p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="mt-8 flex flex-col sm:flex-row gap-3">
                        <template v-if="type === 'confirm'">
                            <button 
                                @click="handleCancel" 
                                :disabled="isLoading"
                                class="flex-1 px-6 py-4 rounded-2xl bg-accent/20 text-foreground/70 font-bold hover:bg-accent/40 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {{ cancelText }}
                            </button>
                            <button 
                                @click="handleConfirm"
                                :disabled="isLoading"
                                class="flex-1 px-6 py-4 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
                                <span v-else>{{ confirmText }}</span>
                            </button>
                        </template>
                        
                        <button 
                            v-else
                            @click="emit('close')" 
                            :disabled="isLoading"
                            class="w-full px-6 py-4 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                             <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
                             <span v-else>{{ confirmText }}</span>
                        </button>
                    </div>
                </div>

                <!-- Close Button (Top Right) -->
                <button 
                    v-if="!isLoading"
                    @click="emit('close')" 
                    class="absolute top-4 right-4 p-2 text-foreground/20 hover:text-foreground transition-colors"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
