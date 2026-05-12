<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { X, Save, Box, Package, Hash, DollarSign, AlertTriangle, Image as ImageIcon } from 'lucide-vue-next'
import { useInventoryStore, type Product } from '@/stores/inventory'

const props = defineProps<{
    isOpen: boolean,
    product?: Product | null
}>()

const emit = defineEmits(['close'])
const inventoryStore = useInventoryStore()

const form = reactive({
    name: '',
    categoryId: '',
    price: 0,
    stock: 0,
    minStock: 5,
    unit: 'unid',
    image: ''
})

watch(() => props.isOpen, (val) => {
    if (val) {
        if (props.product) {
            Object.assign(form, {
                name: props.product.name,
                categoryId: props.product.category?.id || '',
                price: props.product.price,
                stock: props.product.stock,
                minStock: props.product.minStock,
                unit: props.product.unit,
                image: props.product.image || ''
            })
            imagePreview.value = props.product.image ? (props.product.image.startsWith('http') ? props.product.image : `http://127.0.0.1:3000${props.product.image}`) : ''
        } else {
            Object.assign(form, {
                name: '',
                categoryId: '',
                price: 0,
                stock: 0,
                minStock: 5,
                unit: 'unid',
                image: ''
            })
            imagePreview.value = ''
        }
        selectedFile.value = null
    }
})

const isSubmitting = ref(false)
const imagePreview = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
        selectedFile.value = file
        imagePreview.value = URL.createObjectURL(file)
    }
}

const handleSubmit = async () => {
    if (!form.name || !form.categoryId || isSubmitting.value) return
    
    isSubmitting.value = true
    try {
        if (selectedFile.value) {
            const imageUrl = await inventoryStore.uploadImage(selectedFile.value)
            form.image = imageUrl
        }
        
        if (props.product) {
            await inventoryStore.updateProduct(props.product.id, form)
        } else {
            await inventoryStore.addProduct(form)
        }
        
        // Reset form
        Object.assign(form, {
            name: '',
            categoryId: '',
            price: 0,
            stock: 0,
            minStock: 5,
            unit: 'unid',
            image: ''
        })
        imagePreview.value = ''
        selectedFile.value = null
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
        <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div 
                class="w-full max-w-2xl bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-8"
                @click.stop
            >
                <!-- Header -->
                <div class="p-8 border-b border-border bg-primary/5 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <Box class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black uppercase tracking-tight">{{ product ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
                            <p class="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{{ product ? 'Actualiza los detalles del producto' : 'Añade stock a tu inventario' }}</p>
                        </div>
                    </div>
                    <button @click="emit('close')" class="p-2 hover:bg-accent rounded-xl transition-colors">
                        <X class="w-6 h-6 text-foreground/40" />
                    </button>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Image Upload -->
                    <div class="md:col-span-2 space-y-4">
                        <label class="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Imagen del Producto</label>
                        <div class="flex items-center gap-6">
                            <div 
                                class="w-32 h-32 rounded-3xl bg-accent/20 border-2 border-dashed border-border flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary/50 transition-all"
                                @click="fileInput?.click()"
                            >
                                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                                <div v-else class="flex flex-col items-center gap-2 text-foreground/20 group-hover:text-primary transition-colors">
                                    <ImageIcon class="w-8 h-8" />
                                    <span class="text-[8px] font-black uppercase">Subir</span>
                                </div>
                            </div>
                            <div class="flex-1 space-y-2">
                                <p class="text-xs font-bold text-foreground/60">Sube una foto representativa.</p>
                                <p class="text-[10px] text-foreground/30">PNG, JPG o WEBP. Max 2MB.</p>
                                <button 
                                    type="button" 
                                    @click="fileInput?.click()"
                                    class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                >
                                    Seleccionar archivo
                                </button>
                                <input 
                                    ref="fileInput"
                                    type="file" 
                                    class="hidden" 
                                    accept="image/*"
                                    @change="handleFileChange"
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Name -->
                    <div class="md:col-span-2 space-y-2">
                        <label class="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Nombre del Producto</label>
                        <div class="relative">
                            <Package class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                            <input 
                                v-model="form.name"
                                type="text"
                                placeholder="Ej: Coca Cola Zero 33cl"
                                required
                                class="w-full pl-16 pr-6 py-4 bg-accent/20 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            >
                        </div>
                    </div>

                    <!-- Category -->
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Categoría</label>
                        <select 
                            v-model="form.categoryId"
                            required
                            class="w-full px-6 py-4 bg-accent/20 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                        >
                            <option value="" disabled>Selecciona categoría</option>
                            <option v-for="cat in inventoryStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>

                    <!-- Price -->
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Precio de Compra</label>
                        <div class="relative">
                            <DollarSign class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                            <input 
                                v-model.number="form.price"
                                type="number"
                                step="0.01"
                                required
                                class="w-full pl-16 pr-6 py-4 bg-accent/20 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            >
                        </div>
                    </div>

                    <!-- Stock -->
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Stock Inicial</label>
                        <div class="relative">
                            <Hash class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                            <input 
                                v-model.number="form.stock"
                                type="number"
                                required
                                class="w-full pl-16 pr-6 py-4 bg-accent/20 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            >
                        </div>
                    </div>

                    <!-- Min Stock -->
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Stock Mínimo (Alerta)</label>
                        <div class="relative">
                            <AlertTriangle class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                            <input 
                                v-model.number="form.minStock"
                                type="number"
                                required
                                class="w-full pl-16 pr-6 py-4 bg-accent/20 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            >
                        </div>
                    </div>

                    <!-- Submit -->
                    <div class="md:col-span-2 pt-4">
                        <button 
                            type="submit"
                            :disabled="!form.name || !form.categoryId || isSubmitting"
                            class="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            <Save v-if="!isSubmitting" class="w-5 h-5" />
                            <span v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            {{ isSubmitting ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Guardar Producto') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </transition>
</template>
