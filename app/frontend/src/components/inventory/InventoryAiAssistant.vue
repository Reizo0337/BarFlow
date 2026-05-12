<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Sparkles, Send, X, Bot, User, Loader2, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Command, PlusCircle, Link } from 'lucide-vue-next'
import api from '@/services/api'
import { useInventoryStore } from '@/stores/inventory'

const props = defineProps<{
    isSidebar?: boolean
}>()

const inventoryStore = useInventoryStore()
const isExpanded = ref(props.isSidebar ? true : false)
const input = ref('')
const messages = ref<any[]>([
    { 
        role: 'assistant', 
        content: 'BarFlow Neural Engine activo. ¿En qué puedo ayudarle con el inventario hoy?' 
    }
])
const isTyping = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const activeConfirmation = ref<any>(null)

const resolveImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000'
    return `${baseUrl}${url}`
}

const triggerFileUpload = (res: any) => {
    activeConfirmation.value = res
    fileInput.value?.click()
}

const handleFileUpload = async (event: any) => {
    const file = event.target.files[0]
    if (!file || !activeConfirmation.value) return

    try {
        const imageUrl = await inventoryStore.uploadImage(file)
        const target = activeConfirmation.value.details || activeConfirmation.value.data
        if (target) {
            // Use spread to ensure reactivity
            if (activeConfirmation.value.details) activeConfirmation.value.details = { ...target, image: imageUrl }
            else activeConfirmation.value.data = { ...target, image: imageUrl }
            
            // Update content for AI history
            const msg = messages.value.find(m => 
                m.details && (Array.isArray(m.details) ? m.details.includes(activeConfirmation.value) : m.details === activeConfirmation.value)
            )
            if (msg) {
                msg.content += ` [Imagen: ${imageUrl}]`
            }
        }
    } catch (error) {
        console.error('Error uploading image in AI:', error)
    } finally {
        activeConfirmation.value = null
        event.target.value = ''
    }
}

const setRemoteUrl = (res: any) => {
    if (!res._imageUrl || !res) return
    
    const target = res.details || res.data
    if (target) {
        // Use spread to ensure reactivity
        if (res.details) res.details = { ...target, image: res._imageUrl }
        else res.data = { ...target, image: res._imageUrl }
        
        // Update content for AI history
        const msg = messages.value.find(m => 
            m.details && (Array.isArray(m.details) ? m.details.includes(res) : m.details === res)
        )
        if (msg) {
            msg.content += ` [Imagen URL: ${res._imageUrl}]`
        }
    }
    
    res._imageUrl = ''
    res._showUrlInput = false
}

const resolveConfirmation = async (res: any) => {
    isTyping.value = true
    try {
        const rawData = res.details || res.data
        if (res.intent === 'create_product' || rawData.intent === 'create_product') {
            const { intent, categoryName, ...rest } = rawData
            const productData = {
                ...rest,
                category: categoryName || 'Otros'
            }
            
            console.log('Enviando producto a guardar:', productData)
            await inventoryStore.addProduct(productData)
            
            // Update the actual action object to reflect success
            res.status = 'success'
            res.message = '¡Producto creado con éxito!'
            
            messages.value.push({ 
                role: 'assistant', 
                content: `He guardado "${productData.name}" en el inventario. Todo listo.` 
            })
        } else {
            input.value = 'Sí'
            await sendCommand()
        }
    } catch (error: any) {
        console.error('Error al guardar producto:', error)
        res.status = 'error'
        res.message = error.response?.data?.message || 'Error al guardar el producto.'
    } finally {
        isTyping.value = false
        scrollToBottom()
    }
}

const cancelConfirmation = (res: any) => {
    res.status = 'error'
    res.message = 'Cancelado por el usuario.'
    input.value = 'No'
    sendCommand()
}

const scrollToBottom = async () => {
    await nextTick()
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

const sendCommand = async () => {
    if (!input.value.trim() || isTyping.value) return

    const userText = input.value
    input.value = ''
    messages.value.push({ role: 'user', content: userText })
    scrollToBottom()

    isTyping.value = true
    try {
        const response = await api.post('/ai/command', { 
            text: userText,
            history: messages.value.slice(-10)
        })
        const results = response.data

        let summaryMessage = ''
        if (Array.isArray(results)) {
            results.forEach(res => {
                if (res.intent === 'chat_response') {
                    summaryMessage += res.message || res.data?.message || ''
                } else if (res.status === 'success') {
                    summaryMessage += `${res.message || 'Operación completada'}. `
                } else {
                    summaryMessage += `Error: ${res.message}. `
                }
            })
        }

        messages.value.push({ 
            role: 'assistant', 
            content: summaryMessage || 'Comando procesado.',
            details: results 
        })

        await inventoryStore.fetchProducts()
        
    } catch (error) {
        messages.value.push({ 
            role: 'assistant', 
            content: 'Error de red o API Key inválida.',
            isError: true
        })
    } finally {
        isTyping.value = false
        scrollToBottom()
    }
}

onMounted(scrollToBottom)
</script>

<template>
    <div 
        class="w-full flex flex-col transition-all duration-500 overflow-hidden"
        :class="isSidebar ? 'h-full bg-transparent' : 'bg-primary/5 border border-primary/20 rounded-[3rem]'"
    >
        <!-- Trigger Bar (Main View) -->
        <button 
            v-if="!isSidebar"
            @click="isExpanded = !isExpanded"
            class="w-full px-10 py-6 flex items-center justify-between hover:bg-primary/5 transition-colors group"
        >
            <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
                    <Sparkles class="w-6 h-6" />
                </div>
                <div class="text-left">
                    <h3 class="font-black text-sm uppercase tracking-[0.2em] text-primary">Neural Inventory Assistant</h3>
                    <p class="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Active & Ready for commands</p>
                </div>
            </div>
            <component :is="isExpanded ? ChevronUp : ChevronDown" class="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors" />
        </button>

        <!-- Chat Workspace -->
        <div 
            v-if="isExpanded || isSidebar" 
            class="flex flex-col overflow-hidden"
            :class="isSidebar ? 'h-[350px]' : 'h-[300px] border-t border-primary/10'"
        >
            <!-- Chat Feed -->
            <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gradient-to-b from-transparent to-accent/5">
                <div 
                    v-for="(msg, idx) in messages" 
                    :key="idx"
                    class="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    :class="msg.role === 'user' ? 'items-end' : 'items-start'"
                >
                    <div 
                        class="max-w-[90%] p-4 rounded-3xl text-[13px] font-bold shadow-sm leading-relaxed"
                        :class="msg.role === 'user' 
                            ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10' 
                            : 'bg-white text-foreground/80 rounded-tl-none border border-border/50'"
                    >
                        {{ msg.content }}
                    </div>
                    
                    <!-- Action Pills & Confirmation Cards -->
                    <div v-if="msg.details" class="flex flex-col gap-3 w-full">
                        <div 
                            v-for="(res, ridx) in msg.details" 
                            :key="ridx"
                            class="flex flex-col gap-3"
                        >
                            <!-- Status Badge -->
                            <div 
                                v-if="res.status === 'success' || res.status === 'error'"
                                class="space-y-2"
                            >
                                <div 
                                    class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit"
                                    :class="{
                                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-600': res.status === 'success',
                                        'bg-destructive/10 border-destructive/20 text-destructive': res.status === 'error'
                                    }"
                                >
                                    <div v-if="res.status === 'success'" class="w-1 h-1 bg-current rounded-full"></div>
                                    {{ res.status === 'success' ? 'Completado' : 'Fallo' }}
                                </div>
                                <div v-if="res.message" class="text-[11px] font-medium text-foreground/60 italic">
                                    {{ res.message }}
                                </div>
                            </div>

                            <!-- Detailed Confirmation Card (Only when pending) -->
                            <div 
                                v-if="res.status === 'pending_confirmation'"
                                class="bg-white border border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-4 animate-in zoom-in-95 duration-300"
                            >
                                <div class="flex items-center gap-3 text-amber-600">
                                    <AlertCircle class="w-4 h-4" />
                                    <span class="text-[10px] font-black uppercase tracking-widest">Confirmación Requerida</span>
                                </div>

                                <!-- Product Preview or Upload -->
                                <div v-if="res.details?.name || res.data?.name" class="flex gap-4 bg-accent/5 p-4 rounded-2xl">
                                    <div 
                                        class="w-20 h-20 rounded-xl bg-white border border-border overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer hover:border-primary transition-colors group/img"
                                        @click="triggerFileUpload(res)"
                                    >
                                        <img 
                                            v-if="res.details?.image || res.data?.image"
                                            :src="resolveImageUrl(res.details?.image || res.data?.image)" 
                                            class="w-full h-full object-cover"
                                            alt="Preview"
                                        />
                                        <div v-else class="flex flex-col items-center gap-1 text-foreground/20 group-hover/img:text-primary transition-colors">
                                            <Sparkles class="w-5 h-5" />
                                            <span class="text-[8px] font-black uppercase">Subir</span>
                                        </div>
                                    </div>
                                    <div class="flex-1 space-y-1">
                                        <p class="text-xs font-black uppercase tracking-tight">{{ res.details?.name || res.data?.name }}</p>
                                        <p class="text-[10px] font-bold text-foreground/40">Precio: ${{ res.details?.price || res.data?.price }}</p>
                                        <p class="text-[10px] font-bold text-foreground/40">Stock: {{ res.details?.stock || res.data?.stock }}</p>
                                        
                                        <div 
                                            v-if="!(res.details?.image || res.data?.image)"
                                            class="mt-2 flex flex-col gap-2"
                                        >
                                            <div class="flex items-center gap-2">
                                                <button 
                                                    @click="triggerFileUpload(res)"
                                                    class="text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1"
                                                >
                                                    <PlusCircle class="w-3 h-3" />
                                                    Subir Archivo
                                                </button>
                                                <div class="w-1 h-1 bg-foreground/10 rounded-full"></div>
                                                <button 
                                                    @click="res._showUrlInput = !res._showUrlInput"
                                                    class="text-[8px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1"
                                                >
                                                    <Link class="w-3 h-3" />
                                                    Pegar Enlace
                                                </button>
                                            </div>

                                            <div v-if="res._showUrlInput" class="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                                <input 
                                                    v-model="res._imageUrl"
                                                    type="text"
                                                    placeholder="https://..."
                                                    class="flex-1 bg-white border border-border rounded-lg px-3 py-1.5 text-[10px] outline-none focus:border-primary/30"
                                                    @keyup.enter="setRemoteUrl(res)"
                                                >
                                                <button 
                                                    @click="setRemoteUrl(res)"
                                                    class="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-black"
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="text-[11px] font-medium text-foreground/60 italic">
                                    {{ res.message || '¿Desea proceder con esta acción?' }}
                                </div>

                                <div class="flex gap-2">
                                    <button 
                                        @click="resolveConfirmation(res)"
                                        class="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Confirmar y Guardar
                                    </button>
                                    <button 
                                        @click="cancelConfirmation(res)"
                                        class="px-4 py-2.5 bg-accent/20 text-foreground/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/40 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Typing Animation -->
                <div v-if="isTyping" class="flex items-center gap-3 text-primary p-2 animate-pulse">
                    <div class="flex gap-1">
                        <span class="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                        <span class="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span class="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest opacity-60">Procesando...</span>
                </div>
            </div>

            <!-- Terminal Input -->
            <div class="p-4 bg-white/50 backdrop-blur-md border-t border-border/50">
                <form @submit.prevent="sendCommand" class="relative group">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors">
                        <Command class="w-4 h-4" />
                    </div>
                    <input 
                        v-model="input"
                        type="text"
                        placeholder="Escribir comando..."
                        class="w-full bg-accent/20 border border-transparent focus:border-primary/20 rounded-2xl pl-12 pr-12 py-4 text-sm font-black outline-none transition-all placeholder:text-foreground/20 placeholder:font-bold"
                    >
                    <button 
                        type="submit"
                        :disabled="!input.trim() || isTyping"
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
                    >
                        <Send class="w-4 h-4" />
                    </button>
                </form>
                <div class="mt-2 flex justify-center">
                    <p class="text-[8px] font-black text-foreground/20 uppercase tracking-[0.3em]">Neural Interface v2.0</p>
                </div>
            </div>
        </div>

        <!-- Hidden File Input for AI Uploads -->
        <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept="image/*"
            @change="handleFileUpload"
        />
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
