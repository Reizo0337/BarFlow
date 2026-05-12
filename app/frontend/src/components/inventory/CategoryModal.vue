<script setup lang="ts">
import { ref } from 'vue'
import { X, Save, Tag } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close'])
const inventoryStore = useInventoryStore()
const categoryName = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
    if (!categoryName.value.trim() || isSubmitting.value) return
    
    isSubmitting.value = true
    try {
        await inventoryStore.addCategory(categoryName.value)
        categoryName.value = ''
        emit('close')
    } catch (error) {
        console.error(error)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div 
                class="w-full max-w-md bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                @click.stop
            >
                <!-- Header -->
                <div class="p-8 border-b border-border bg-primary/5 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <Tag class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black uppercase tracking-tight">Nueva Categoría</h3>
                            <p class="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Organiza tus productos</p>
                        </div>
                    </div>
                    <button @click="emit('close')" class="p-2 hover:bg-accent rounded-xl transition-colors">
                        <X class="w-6 h-6 text-foreground/40" />
                    </button>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Nombre de la Categoría</label>
                        <input 
                            v-model="categoryName"
                            type="text"
                            placeholder="Ej: Bebidas, Comida, Limpieza..."
                            required
                            autofocus
                            class="w-full px-6 py-4 bg-accent/20 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        >
                    </div>

                    <button 
                        type="submit"
                        :disabled="!categoryName.trim() || isSubmitting"
                        class="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        <Save v-if="!isSubmitting" class="w-5 h-5" />
                        <span v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        {{ isSubmitting ? 'Guardando...' : 'Crear Categoría' }}
                    </button>
                </form>
            </div>
        </div>
    </transition>
</template>
