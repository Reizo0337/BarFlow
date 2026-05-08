<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Wine, Building2, KeyRound, ArrowRight, Loader2, Lock } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const companyCode = ref('')
const pin = ref('')
const isLoading = ref(false)
const error = ref('')

const isFixedCompany = computed(() => !!route.params.code)

onMounted(() => {
    if (route.params.code) {
        companyCode.value = route.params.code as string
    }
})

const handleLogin = async () => {
    if (!companyCode.value || !pin.value) {
        error.value = 'Por favor, rellena todos los campos'
        return
    }

    isLoading.value = true
    error.value = ''
    
    try {
        const success = await authStore.loginSaaS(companyCode.value, pin.value)
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
    <div class="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-primary selection:text-white">
        <!-- Abstract Background -->
        <div class="absolute inset-0 overflow-hidden -z-10">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full"></div>
        </div>

        <div class="w-full max-w-md space-y-12 animate-in fade-in zoom-in duration-700">
            <!-- Logo -->
            <div class="text-center space-y-4">
                <div class="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 group">
                    <Wine v-if="!isFixedCompany" class="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                    <Lock v-else class="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h1 class="text-4xl font-black tracking-tighter uppercase">
                    <template v-if="isFixedCompany">{{ companyCode }} <span class="text-primary">TPV</span></template>
                    <template v-else>Bar<span class="text-primary">Flow</span> Portal</template>
                </h1>
                <p class="text-white/40 font-medium tracking-wide">
                    {{ isFixedCompany ? 'Terminal de punto de venta privado' : 'Acceso exclusivo para empleados y administración' }}
                </p>
            </div>

            <!-- Login Card -->
            <div class="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8">
                <div class="space-y-6">
                    <!-- Company Code (Only if not fixed) -->
                    <div v-if="!isFixedCompany" class="space-y-3">
                        <label class="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Código de Empresa</label>
                        <div class="relative group">
                            <Building2 class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input 
                                v-model="companyCode"
                                type="text" 
                                placeholder="Ej: BCENTRAL"
                                class="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold tracking-widest placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                            />
                        </div>
                    </div>

                    <!-- Employee PIN -->
                    <div class="space-y-3">
                        <label class="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Pin Personal</label>
                        <div class="relative group">
                            <KeyRound class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input 
                                v-model="pin"
                                type="password" 
                                maxlength="4"
                                placeholder="••••"
                                class="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-black tracking-[1em] text-2xl placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <!-- Error Message -->
                <p v-if="error" class="text-destructive text-sm font-black text-center animate-shake">{{ error }}</p>

                <!-- Submit Button -->
                <button 
                    @click="handleLogin"
                    :disabled="isLoading"
                    class="w-full bg-primary text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 disabled:scale-100"
                >
                    <Loader2 v-if="isLoading" class="w-6 h-6 animate-spin" />
                    <template v-else>
                        Entrar en TPV <ArrowRight class="w-6 h-6" />
                    </template>
                </button>
            </div>

            <!-- Footer -->
            <div class="text-center space-y-4">
                <RouterLink 
                    v-if="isFixedCompany" 
                    to="/portal" 
                    class="text-primary/60 hover:text-primary text-xs font-black uppercase tracking-widest transition-colors"
                >
                    No soy de esta empresa
                </RouterLink>

                <RouterLink to="/" class="text-white/10 hover:text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 pt-4">
                    BarFlow SaaS Platform <Wine class="w-3 h-3" />
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.text-primary { color: #00DBB7; }
.bg-primary { background-color: #00DBB7; }
.text-destructive { color: #ff3b3b; }

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
.animate-shake {
    animation: shake 0.2s ease-in-out 0s 2;
}
</style>
