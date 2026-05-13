<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Wine, ArrowRight, Loader2, Sun, Moon, Building2, RefreshCcw } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const companyCode = ref(authStore.companyCode || '')
const pin = ref('')
const isLoading = ref(false)
const error = ref('')
const isDark = ref(true)

const pinInput = ref<HTMLInputElement | null>(null)

const isFixedCompany = computed(() => !!route.params.code || !!authStore.companyCode)

onMounted(() => {
    if (route.params.code) companyCode.value = route.params.code as string
    isDark.value = document.documentElement.classList.contains('dark')
    
    // Auto-focus PIN if company is already set
    if (companyCode.value) {
        nextTick(() => {
            pinInput.value?.focus()
        })
    }
})

const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
}

const resetCompany = () => {
    authStore.clearAll()
    companyCode.value = ''
    pin.value = ''
    error.value = ''
}

const handleLogin = async () => {
    const code = companyCode.value?.trim()
    const p = pin.value?.trim()

    if (!code || !p) {
        error.value = 'Rellena todos los campos'
        return
    }

    isLoading.value = true
    error.value = ''
    
    try {
        const success = await authStore.loginSaaS(code, p)
        if (success) {
            router.push('/app/dashboard')
        } else {
            error.value = 'PIN incorrecto'
            pin.value = ''
        }
    } catch (e: any) {
        error.value = 'Error de conexión'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-background text-foreground flex items-center justify-center p-0 selection:bg-primary selection:text-white transition-colors duration-500 overflow-hidden font-sans uppercase tracking-tight">
        
        <!-- DECO -->
        <div class="absolute inset-0 z-0 pointer-events-none">
            <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
        </div>

        <!-- ACTIONS (Top) -->
        <div class="fixed top-10 right-10 z-50 flex items-center gap-4">
            <BaseButton variant="secondary" @click="router.push('/')">
                <template #icon-left><ArrowRight class="w-5 h-5 rotate-180" /></template>
                VOLVER
            </BaseButton>
            <BaseButton variant="secondary" size="icon" @click="toggleTheme">
                <Sun v-if="isDark" class="w-6 h-6" />
                <Moon v-else class="w-6 h-6" />
            </BaseButton>
        </div>

        <!-- LOGIN CONTAINER -->
        <div class="w-full max-w-[1000px] h-[650px] hidden lg:grid grid-cols-2 bg-card rounded-[4rem] overflow-hidden shadow-2xl border border-border relative z-10 animate-in zoom-in duration-700">
            
            <!-- LEFT ART -->
            <div class="relative overflow-hidden group border-r border-border bg-black">
                <img 
                    src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=2070" 
                    class="w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-[3000ms]"
                    alt="Bar"
                />
                <div class="absolute inset-0 p-16 flex flex-col justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <Wine class="w-7 h-7 text-white" />
                        </div>
                        <span class="text-3xl font-black tracking-tighter text-white">Bar<span class="text-primary">Flow</span></span>
                    </div>

                    <div class="space-y-6">
                        <h2 class="text-6xl font-black text-white leading-[0.8] italic">
                            ELITE <br/> 
                            <span class="text-primary not-italic tracking-tighter">PORTAL</span>
                        </h2>
                        <p class="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">Acceso restringido a terminales autorizados.</p>
                    </div>

                    <div class="text-[9px] font-black text-white/10 tracking-[0.5em]">EST. 2026 / V4.3.0</div>
                </div>
            </div>

            <!-- RIGHT FORM -->
            <div class="bg-card flex flex-col items-center justify-center p-16 relative">
                <div class="w-full max-w-sm space-y-12">
                    <div class="space-y-2">
                        <h3 class="text-4xl font-black text-foreground tracking-tighter italic">{{ companyCode ? 'AUTH' : 'ACCESO' }}</h3>
                        <div class="h-1.5 w-12 bg-primary rounded-full"></div>
                    </div>

                    <div class="space-y-8">
                        <!-- Company Selector / Indicator -->
                        <div class="space-y-1">
                            <label class="text-[10px] font-black text-primary tracking-[0.4em] ml-1">EMPRESA</label>
                            <div v-if="authStore.companyCode" class="flex items-center justify-between p-4 bg-accent/20 rounded-2xl border border-primary/10 group">
                                <div class="flex items-center gap-3">
                                    <Building2 class="w-5 h-5 text-primary" />
                                    <span class="text-xl font-black tracking-tight text-foreground uppercase">{{ authStore.companyCode }}</span>
                                </div>
                                <button @click="resetCompany" class="p-2 hover:bg-primary/10 rounded-lg text-foreground/30 hover:text-primary transition-all">
                                    <RefreshCcw class="w-4 h-4" />
                                </button>
                            </div>
                            <input 
                                v-else
                                v-model="companyCode"
                                type="text" 
                                class="w-full bg-transparent border-b-2 border-border py-3 text-2xl font-black focus:outline-none focus:border-primary transition-all uppercase placeholder:text-foreground/5"
                                placeholder="CÓDIGO EMPRESA"
                            />
                        </div>

                        <!-- Personal PIN -->
                        <div class="space-y-1">
                            <label class="text-[10px] font-black text-primary tracking-[0.4em] ml-1">PIN EMPLEADO</label>
                            <input 
                                ref="pinInput"
                                v-model="pin"
                                type="password" 
                                maxlength="6"
                                class="w-full bg-transparent border-b-2 border-border py-3 text-5xl font-black tracking-[0.4em] focus:outline-none focus:border-primary transition-all placeholder:text-foreground/5"
                                placeholder="••••"
                                @keyup.enter="handleLogin"
                            />
                        </div>
                    </div>

                    <div class="min-h-[20px]">
                        <p v-if="error" class="text-destructive text-[10px] font-black tracking-widest uppercase animate-shake">{{ error }}</p>
                    </div>

                    <BaseButton variant="primary" size="xl" class="w-full" :loading="isLoading" @click="handleLogin">
                        ENTRAR AL SISTEMA <template #icon-right><ArrowRight class="w-6 h-6" /></template>
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- MOBILE -->
        <div class="lg:hidden w-full max-w-sm px-8 space-y-16 animate-in fade-in duration-700">
            <div class="text-center space-y-6">
                <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-xl"><Wine class="w-10 h-10 text-white" /></div>
                <h1 class="text-5xl font-black text-foreground tracking-tighter italic italic">Bar<span class="text-primary not-italic">Flow</span></h1>
            </div>
            <div class="space-y-8">
                 <div v-if="authStore.companyCode" class="flex items-center justify-between p-6 bg-accent/20 rounded-[2rem] border border-primary/20">
                    <span class="text-2xl font-black">{{ authStore.companyCode }}</span>
                    <BaseButton variant="secondary" size="icon" @click="resetCompany"><RefreshCcw class="w-5 h-5" /></BaseButton>
                 </div>
                 <BaseInput v-else v-model="companyCode" label="EMPRESA" class="text-2xl" />
                 
                 <BaseInput ref="pinInput" v-model="pin" label="PIN" type="password" class="text-5xl tracking-[0.5em]" @keyup.enter="handleLogin" />
                 
                 <BaseButton variant="primary" size="xl" class="w-full h-20 text-xl" :loading="isLoading" @click="handleLogin">ACCEDER</BaseButton>
            </div>
        </div>

        <div class="fixed bottom-10 left-10 text-foreground/5 font-black text-[12vw] italic pointer-events-none select-none uppercase">Portal</div>
    </div>
</template>

<style scoped>
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
</style>
