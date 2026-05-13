<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Wine, Building2, KeyRound, ArrowRight, Loader2, Lock, Sparkles, ChevronRight, Github, Sun, Moon } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const companyCode = ref('')
const pin = ref('')
const isLoading = ref(false)
const error = ref('')
const isDark = ref(true)

const isFixedCompany = computed(() => !!route.params.code)

onMounted(() => {
    if (route.params.code) {
        companyCode.value = route.params.code as string
    }
    isDark.value = document.documentElement.classList.contains('dark')
})

const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
}

const handleLogin = async () => {
    const code = companyCode.value?.trim()
    const p = pin.value?.trim()

    if (!code || !p) {
        error.value = 'Por favor, rellena todos los campos'
        return
    }

    isLoading.value = true
    error.value = ''
    
    try {
        const success = await authStore.loginSaaS(code, p)
        if (success) {
            router.push('/app/dashboard')
        } else {
            error.value = 'Código o PIN incorrectos'
        }
    } catch (e: any) {
        error.value = 'Error al conectar con el servidor'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-background text-foreground flex items-center justify-center p-0 selection:bg-primary selection:text-white transition-colors duration-500 overflow-hidden font-sans uppercase tracking-tight">
        
        <!-- BACKGROUND DECO -->
        <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
            <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
        </div>

        <!-- THEME TOGGLE & BACK (Top) -->
        <div class="fixed top-10 right-10 z-50 flex items-center gap-4">
            <RouterLink to="/" class="p-4 rounded-full bg-card border border-border shadow-xl hover:scale-110 transition-all text-foreground flex items-center gap-2 px-6 group">
                <ArrowRight class="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span class="text-[10px] font-black tracking-widest">VOLVER</span>
            </RouterLink>
            <button @click="toggleTheme" class="p-4 rounded-full bg-card border border-border shadow-xl hover:scale-110 transition-all text-foreground">
                <Sun v-if="isDark" class="w-6 h-6" />
                <Moon v-else class="w-6 h-6" />
            </button>
        </div>

        <!-- MAIN CONTAINER -->
        <div class="w-full max-w-[900px] h-[600px] hidden lg:grid grid-cols-2 bg-card rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-border relative z-10 animate-in zoom-in duration-700">
            
            <!-- LEFT: ARTISTIC SIDE -->
            <div class="relative overflow-hidden group border-r border-border">
                <img 
                    src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=2070" 
                    class="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-[3000ms] ease-out"
                    alt="Luxury Bar"
                />
                <div class="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"></div>
                
                <div class="absolute inset-0 p-16 flex flex-col justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <Wine class="w-7 h-7 text-white" />
                        </div>
                        <span class="text-3xl font-black tracking-tighter">Bar<span class="text-primary">Flow</span></span>
                    </div>

                    <div class="space-y-6">
                        <h2 class="text-5xl font-black text-foreground leading-[0.85] italic">
                            ELITE <br/> 
                            <span class="text-primary not-italic tracking-tighter">PORTAL</span>
                        </h2>
                        <p class="text-foreground/40 text-[10px] font-black tracking-[0.4em] max-w-xs leading-relaxed">
                            ACCESO RESTRINGIDO A TERMINALES DE GESTIÓN DE ALTO RENDIMIENTO.
                        </p>
                    </div>

                    <div class="flex items-center gap-8 text-[9px] font-black text-foreground/20 tracking-[0.5em]">
                        <span>EST. 2026</span>
                        <span>V4.0.0</span>
                    </div>
                </div>
            </div>

            <!-- RIGHT: LOGIN SIDE -->
            <div class="bg-card flex flex-col items-center justify-center p-12 relative">
                <div class="w-full max-w-xs space-y-8">
                    <div class="space-y-2">
                        <h3 class="text-3xl font-black text-foreground tracking-tighter italic">BIENVENIDO</h3>
                        <div class="h-1 w-10 bg-primary"></div>
                    </div>

                    <div class="space-y-6">
                        <div v-if="!isFixedCompany" class="space-y-1 group">
                            <label class="text-[9px] font-black text-primary tracking-[0.4em]">COMPANY CODE</label>
                            <input 
                                v-model="companyCode"
                                type="text" 
                                class="w-full bg-transparent border-b border-border py-2 text-xl font-black text-foreground focus:outline-none focus:border-primary transition-all uppercase placeholder:text-foreground/5"
                                placeholder="CENTRAL-01"
                            />
                        </div>

                        <div class="space-y-1 group">
                            <label class="text-[9px] font-black text-primary tracking-[0.4em]">PERSONAL PIN</label>
                            <input 
                                v-model="pin"
                                type="password" 
                                maxlength="4"
                                class="w-full bg-transparent border-b border-border py-2 text-3xl font-black text-foreground focus:outline-none focus:border-primary transition-all tracking-[0.5em] placeholder:text-foreground/5"
                                placeholder="••••"
                            />
                        </div>
                    </div>

                    <div class="min-h-[20px]">
                        <div v-if="error" class="text-red-500 text-[10px] font-black tracking-widest animate-shake">
                            {{ error }}
                        </div>
                    </div>

                    <button 
                        @click="handleLogin"
                        :disabled="isLoading"
                        class="w-full py-5 bg-foreground text-background font-black text-lg tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-primary hover:text-white transition-all transform active:scale-95 disabled:opacity-50 shadow-2xl rounded-2xl"
                    >
                        <Loader2 v-if="isLoading" class="w-6 h-6 animate-spin" />
                        <template v-else>
                            ACCEDER <ArrowRight class="w-5 h-5" />
                        </template>
                    </button>
                </div>
            </div>
        </div>

        <!-- MOBILE VERSION -->
        <div class="lg:hidden w-full max-w-md px-8 space-y-16 animate-in fade-in duration-700">
            <div class="text-center space-y-8">
                <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Wine class="w-10 h-10 text-white" />
                </div>
                <h1 class="text-5xl font-black text-foreground tracking-tighter italic uppercase">Bar<span class="text-primary not-italic">Flow</span></h1>
            </div>

            <div class="space-y-10">
                 <div v-if="!isFixedCompany" class="space-y-2 group">
                    <label class="text-[9px] font-black text-primary tracking-[0.4em]">COMPANY</label>
                    <input v-model="companyCode" type="text" class="w-full bg-transparent border-b border-border py-4 text-2xl font-black text-foreground focus:outline-none focus:border-primary transition-all uppercase" />
                </div>

                <div class="space-y-2 group">
                    <label class="text-[9px] font-black text-primary tracking-[0.4em]">PIN</label>
                    <input v-model="pin" type="password" maxlength="4" class="w-full bg-transparent border-b border-border py-4 text-4xl font-black text-foreground focus:outline-none focus:border-primary transition-all tracking-[1em]" />
                </div>

                <button @click="handleLogin" :disabled="isLoading" class="w-full py-8 bg-foreground text-background font-black text-xl tracking-[0.2em] flex items-center justify-center rounded-3xl shadow-2xl">
                    <Loader2 v-if="isLoading" class="w-6 h-6 animate-spin" />
                    <span v-else>ACCEDER</span>
                </button>
            </div>
        </div>

        <!-- DECORATIVE TEXT -->
        <div class="fixed bottom-10 left-10 text-foreground/5 font-black text-[12vw] italic pointer-events-none select-none uppercase">
            Portal
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap');

:deep(body) {
    font-family: 'Inter', sans-serif;
}

@keyframes pulse-slow {
    0%, 100% { opacity: 0.1; transform: scale(1) translate(25%, -25%); }
    50% { opacity: 0.2; transform: scale(1.1) translate(20%, -20%); }
}
.animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}
.animate-shake { animation: shake 0.2s ease-in-out 0s 2; }

::-webkit-scrollbar { display: none; }
</style>
