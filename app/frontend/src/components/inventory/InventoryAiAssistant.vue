<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Sparkles, Send, X, Bot, User, Loader2, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Command } from 'lucide-vue-next'
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
                    
                    <!-- Action Pills -->
                    <div v-if="msg.details" class="flex flex-wrap gap-1.5 px-1">
                        <div 
                            v-for="(res, ridx) in msg.details" 
                            :key="ridx"
                            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                            :class="{
                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-600': res.status === 'success',
                                'bg-destructive/10 border-destructive/20 text-destructive': res.status === 'error',
                                'bg-amber-500/10 border-amber-500/20 text-amber-600': res.status === 'pending_confirmation'
                            }"
                        >
                            <div v-if="res.status === 'success'" class="w-1 h-1 bg-current rounded-full"></div>
                            {{ res.intent }}
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
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
