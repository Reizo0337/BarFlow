<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
    ChevronRight, 
    Wine, 
    Users, 
    CheckCircle2,
    Sun,
    Moon,
    Database,
    Cpu,
    Zap,
    Heart,
    Coffee,
    GlassWater,
    Sparkles
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const authStore = useAuthStore()
const router = useRouter()
const isDark = ref(true)

// Advanced Background Spotlight State
const mouseX = ref(0)
const mouseY = ref(0)
const spotX = ref(0)
const spotY = ref(0)
const spotX2 = ref(0)
const spotY2 = ref(0)

const updateMouse = (e: MouseEvent) => {
    mouseX.value = e.clientX
    mouseY.value = e.clientY
}

let rafId: number
const animateSpotlight = () => {
    spotX.value += (mouseX.value - spotX.value) * 0.08
    spotY.value += (mouseY.value - spotY.value) * 0.08
    spotX2.value += (mouseX.value - spotX2.value) * 0.04
    spotY2.value += (mouseY.value - spotY2.value) * 0.04
    rafId = requestAnimationFrame(animateSpotlight)
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
}

onMounted(() => {
    window.addEventListener('mousemove', updateMouse)
    animateSpotlight()

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('reveal-active')
        })
    }, observerOptions)
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    isDark.value = document.documentElement.classList.contains('dark')
})

onUnmounted(() => {
    window.removeEventListener('mousemove', updateMouse)
    cancelAnimationFrame(rafId)
})

const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
}

const pricing = [
    { name: 'Essential', price: '5€', desc: 'Para bares que empiezan.', features: ['Hasta 2 terminales', 'Gestión base', 'Soporte email'] },
    { name: 'Pro', price: '50€', desc: 'Control total operativo.', features: ['Terminales ilimitados', 'AI Predictiva', 'Soporte 24/7'] },
    { name: 'Custom', price: 'Personalizado', desc: 'Soluciones multi-local.', features: ['API Custom', 'Account Manager', 'Formación'] }
]

const features = [
    { title: 'Control Humano', desc: 'Gestiona tu stock sin complicaciones frías.', icon: Database, variant: 'primary', shape: 'rounded-[4rem_2rem_4rem_2rem]' },
    { title: 'Tu Gente', desc: 'Porque el éxito nace tras la barra.', icon: Heart, variant: 'warning', shape: 'rounded-[2rem_4rem_2rem_4rem]' },
    { title: 'Ritmo Vivo', desc: 'Optimizado para el caos controlado del servicio.', icon: Zap, variant: 'success', shape: 'rounded-[4rem_4rem_2rem_2rem]' },
    { title: 'Visión Clara', desc: 'Datos honestos para decisiones tranquilas.', icon: Cpu, variant: 'primary', shape: 'rounded-[2rem_2rem_4rem_4rem]' }
]
</script>

<template>
    <div class="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white transition-colors duration-500 overflow-x-hidden uppercase font-sans tracking-tight">
        
        <!-- BACKGROUND SPOTLIGHTS -->
        <div class="fixed inset-0 z-0 pointer-events-none">
            <div 
                class="absolute w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full transition-opacity duration-1000"
                :style="{ transform: `translate(${spotX - 400}px, ${spotY - 400}px)` }"
            ></div>
            <div 
                class="absolute w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full transition-opacity duration-1000"
                :style="{ transform: `translate(${spotX2 - 300}px, ${spotY2 - 300}px)` }"
            ></div>
        </div>

        <!-- NAVIGATION -->
        <nav class="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-3xl border-b border-border/50">
            <div class="max-w-[1400px] mx-auto px-8 h-24 flex items-center justify-between">
                <div class="flex items-center gap-4 group cursor-pointer" @click="router.push('/')">
                    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Wine class="w-6 h-6 text-white" />
                    </div>
                    <span class="text-2xl font-black tracking-tighter uppercase">Bar<span class="text-primary">Flow</span></span>
                </div>

                <div class="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                    <a href="#features" class="hover:text-primary transition-colors">Esencia</a>
                    <a href="#pricing" class="hover:text-primary transition-colors">Planes</a>
                    
                    <button @click="toggleTheme" class="p-3 rounded-full hover:bg-accent transition-colors text-foreground">
                        <Sun v-if="isDark" class="w-5 h-5" />
                        <Moon v-else class="w-5 h-5" />
                    </button>

                    <BaseButton :variant="isDark ? 'glass' : 'primary'" size="md" @click="router.push(authStore.token ? '/app/dashboard' : '/portal')">
                        {{ authStore.token ? 'TU PANEL' : 'ACCEDER' }}
                    </BaseButton>
                </div>
            </div>
        </nav>

        <!-- HERO SECTION -->
        <section class="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-8 overflow-hidden">
            <div class="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10">
                <Coffee class="absolute top-1/4 left-1/4 w-12 h-12 animate-bounce-slow text-primary" />
                <GlassWater class="absolute bottom-1/4 right-1/4 w-16 h-16 animate-bounce-slow delay-1000 text-primary" />
                <Sparkles class="absolute top-1/3 right-1/3 w-8 h-8 animate-pulse text-primary" />
            </div>

            <div class="max-w-[1400px] mx-auto text-center space-y-16 relative z-10">
                <div class="reveal reveal-down">
                    <h1 class="text-7xl md:text-[150px] font-black leading-[0.75] tracking-tighter text-foreground uppercase italic drop-shadow-2xl">
                        EL ARTE DE <br/> 
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-foreground/40 not-italic">SERVIR</span>
                    </h1>
                </div>
                
                <div class="reveal reveal-up space-y-8 animation-delay-200">
                    <p class="text-2xl md:text-4xl text-foreground/30 max-w-4xl mx-auto font-black leading-tight tracking-tighter uppercase italic">
                        No somos un sistema de gestión. <br/>
                        Somos el pulso de tu establecimiento.
                    </p>
                    <div class="h-1 w-20 bg-primary/20 mx-auto rounded-full"></div>
                </div>

                <div class="reveal reveal-up pt-10 animation-delay-400">
                    <BaseButton variant="primary" size="xl" class="group shadow-2xl shadow-primary/30 rounded-[2rem] px-20 text-xl" @click="router.push('/portal')">
                        Empezar la Experiencia
                        <template #icon-right><ChevronRight class="w-7 h-7 group-hover:translate-x-2 transition-transform" /></template>
                    </BaseButton>
                </div>
            </div>
        </section>

        <!-- HUMAN BENTO GRID -->
        <section id="features" class="py-40 px-8 relative bg-accent/5 overflow-hidden">
            <div class="max-w-[1200px] mx-auto space-y-24">
                <div class="text-center space-y-8 reveal reveal-up">
                    <h2 class="text-6xl font-black uppercase tracking-tighter italic">NUESTRA <span class="text-primary not-italic">ESENCIA</span></h2>
                    <p class="text-foreground/30 font-black uppercase tracking-[0.6em] text-[11px] max-w-lg mx-auto leading-relaxed">Tecnología con tacto humano.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div v-for="(f, i) in features" :key="i" 
                         class="reveal reveal-up p-10 bg-card border border-border flex flex-col group hover:border-primary/50 transition-all duration-1000 shadow-xl hover:-translate-y-2"
                         :class="f.shape"
                         :style="{ transitionDelay: (i * 150) + 'ms' }">
                        <div class="w-14 h-14 rounded-[1.5rem] bg-accent/30 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-md">
                            <component :is="f.icon" class="w-7 h-7" />
                        </div>
                        <h3 class="text-2xl font-black mb-3 uppercase italic tracking-tighter group-hover:text-primary transition-colors duration-500">{{ f.title }}</h3>
                        <p class="text-foreground/40 text-[11px] font-black leading-relaxed uppercase tracking-widest italic lowercase first-letter:uppercase">{{ f.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- PRICING -->
        <section id="pricing" class="py-40 px-8 relative">
            <div class="max-w-[1000px] mx-auto space-y-20">
                <div class="text-center space-y-6 reveal reveal-up">
                    <h2 class="text-6xl font-black uppercase tracking-tighter italic">PLANES <span class="text-primary not-italic">HONESTOS</span></h2>
                    <p class="text-foreground/30 font-black uppercase tracking-[0.5em] text-[10px]">Simple y directo.</p>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <BaseCard v-for="(plan, idx) in pricing" :key="idx" 
                        class="reveal reveal-up p-8 flex flex-col justify-between border-border/50 transition-all duration-700 hover:border-primary/30 min-w-0"
                        :class="idx === 1 ? 'border-primary ring-2 ring-primary/5 scale-105 z-10 rounded-[3rem_1rem_3rem_1rem]' : 'rounded-[2rem]'">
                        <div class="space-y-8">
                            <div class="text-center">
                                <span v-if="idx === 1" class="inline-block px-3 py-1 bg-primary text-white text-[8px] font-black rounded-full tracking-[0.4em] mb-3 shadow-md">TOP</span>
                                <h4 class="text-xl font-black uppercase tracking-tighter italic">{{ plan.name }}</h4>
                            </div>
                            
                            <div class="text-center space-y-1">
                                <div 
                                    class="font-black italic tracking-tighter leading-none flex items-center justify-center gap-1"
                                    :class="plan.price.length > 5 ? 'text-3xl' : 'text-5xl'"
                                >
                                    {{ plan.price.replace('€','') }}
                                    <span v-if="!plan.price.includes('Personalizado')" class="text-xl font-bold not-italic text-primary">€</span>
                                </div>
                                <p class="text-[10px] font-black text-foreground/20 tracking-widest truncate">{{ plan.price.includes('Personalizado') ? 'SOLUCIÓN' : 'MENSUAL' }}</p>
                            </div>

                            <ul class="space-y-4 pt-6 border-t border-border/50">
                                <li v-for="feat in plan.features" :key="feat" class="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider text-foreground/50">
                                    <CheckCircle2 class="w-3 h-3 text-primary shrink-0" /> 
                                    <span class="truncate">{{ feat }}</span>
                                </li>
                            </ul>
                        </div>
                        <BaseButton :variant="idx === 1 ? 'primary' : 'outline'" size="md" class="mt-10 w-full rounded-xl shadow-lg">
                            {{ idx === 2 ? 'HABLAR' : 'ELEGIR' }}
                        </BaseButton>
                    </BaseCard>
                </div>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="py-32 px-8 border-t border-border bg-card relative z-10">
            <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <Wine class="w-6 h-6 text-white" />
                    </div>
                    <span class="text-2xl font-black tracking-tighter uppercase">Bar<span class="text-primary">Flow</span></span>
                </div>
                <div class="flex gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-foreground/10">
                    <a href="#" class="hover:text-primary transition-all duration-300">Legal</a>
                    <a href="#" class="hover:text-primary transition-all duration-300">Privacidad</a>
                    <a href="#" class="hover:text-primary transition-all duration-300">© 2026</a>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.reveal { opacity: 0; transition: all 1.8s cubic-bezier(0.19, 1, 0.22, 1); }
.reveal-up { transform: translateY(100px); }
.reveal-down { transform: translateY(-100px); }
.reveal.reveal-active { opacity: 1; transform: translate(0, 0); }

@keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}
.animate-bounce-slow { animation: bounce-slow 5s infinite ease-in-out; }

@keyframes pulse-slow {
    0%, 100% { opacity: 0.05; transform: scale(1) translate(-50%, -50%); }
    50% { opacity: 0.15; transform: scale(1.1) translate(-50%, -50%); }
}
.animate-pulse-slow { animation: pulse-slow 15s infinite ease-in-out; }

::selection {
    background: #059669;
    color: white;
}
</style>
