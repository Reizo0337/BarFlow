<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { 
    BarChart3, 
    ShieldCheck, 
    Zap, 
    ChevronRight, 
    Wine, 
    Users, 
    ArrowRight,
    Star,
    Layers,
    Smartphone,
    TrendingUp,
    CheckCircle2,
    Play,
    Sun,
    Moon,
    Clock,
    Database,
    Cpu
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isDark = ref(true)

// Scroll reveal logic
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
}

onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active')
            }
        })
    }, observerOptions)

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    
    isDark.value = document.documentElement.classList.contains('dark')
})

const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
}

const pricing = [
    {
        name: 'Essential',
        price: '49€',
        desc: 'Ideal para bares pequeños y locales locales.',
        features: ['Hasta 2 terminales', 'Gestión de inventario base', 'Informes diarios', 'Soporte por email']
    },
    {
        name: 'Professional',
        price: '99€',
        desc: 'Para restaurantes que buscan control total.',
        features: ['Terminales ilimitados', 'Análisis predictivo AI', 'Gestión de personal', 'Integración con proveedores', 'Soporte 24/7']
    },
    {
        name: 'Enterprise',
        price: 'Personalizado',
        desc: 'Soluciones a medida para grandes franquicias.',
        features: ['Multi-local centralizado', 'API personalizada', 'Account manager dedicado', 'Formación presencial']
    }
]

const features = [
    {
        title: 'Inventario Pro',
        desc: 'Control total de stock en tiempo real con alertas de bajo nivel.',
        icon: Database,
        color: 'text-blue-500'
    },
    {
        title: 'Gestión Staff',
        desc: 'Organiza turnos y mide el rendimiento de tu equipo.',
        icon: Users,
        color: 'text-orange-500'
    },
    {
        title: 'Venta Rápida',
        desc: 'Terminal optimizado para el ritmo frenético de la barra.',
        icon: Zap,
        color: 'text-yellow-500'
    },
    {
        title: 'Reportes AI',
        desc: 'Análisis inteligente para optimizar tus márgenes de beneficio.',
        icon: Cpu,
        color: 'text-purple-500'
    }
]
</script>

<template>
    <div class="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white transition-colors duration-500 overflow-x-hidden uppercase font-sans tracking-tight">
        
        <!-- NAVIGATION -->
        <nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-2xl border-b border-border transition-colors duration-500">
            <div class="max-w-[1400px] mx-auto px-8 h-24 flex items-center justify-between">
                <div class="flex items-center gap-4 group cursor-pointer">
                    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(5,150,105,0.3)] group-hover:scale-110 transition-transform">
                        <Wine class="w-6 h-6 text-white" />
                    </div>
                    <span class="text-2xl font-black tracking-tighter uppercase">Bar<span class="text-primary">Flow</span></span>
                </div>

                <div class="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">
                    <a href="#features" class="hover:text-primary transition-colors">Características</a>
                    <a href="#pricing" class="hover:text-primary transition-colors">Precios</a>
                    
                    <button @click="toggleTheme" class="p-3 rounded-full hover:bg-accent transition-colors text-foreground">
                        <Sun v-if="isDark" class="w-5 h-5" />
                        <Moon v-else class="w-5 h-5" />
                    </button>

                    <RouterLink :to="authStore.token ? '/app/dashboard' : '/portal'" class="group px-8 py-4 bg-foreground text-background rounded-full hover:bg-primary hover:text-white transition-all transform active:scale-95 shadow-xl">
                        <span class="text-[11px] font-black tracking-[0.2em]">{{ authStore.token ? 'PANEL' : 'LOGIN' }}</span>
                    </RouterLink>
                </div>
            </div>
        </nav>

        <!-- HERO SECTION -->
        <section class="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-8 overflow-hidden">
            <div class="absolute inset-0 z-0">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-primary/10 blur-[180px] rounded-full animate-pulse-slow"></div>
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
            </div>

            <div class="max-w-[1200px] mx-auto text-center space-y-12 relative z-10">
                <div class="reveal reveal-down">
                    <span class="inline-block px-6 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                        The Future of Hospitality
                    </span>
                    <h1 class="text-7xl md:text-[120px] font-black leading-[0.85] tracking-tighter text-foreground uppercase italic">
                        MAXIMIZA <br/> 
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-foreground/40">TU ÉXITO</span>
                    </h1>
                </div>
                
                <p class="reveal reveal-up text-xl md:text-2xl text-foreground/40 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight animation-delay-200">
                    La plataforma SaaS definitiva para la gestión de bares y restaurantes. Control total, desde el stock hasta la última propina.
                </p>

                <div class="reveal reveal-up flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 animation-delay-400">
                    <RouterLink :to="authStore.token ? '/app/dashboard' : '/portal'" class="group flex items-center gap-4 px-12 py-6 bg-primary text-white rounded-full font-black text-xl hover:scale-105 transition-all shadow-[0_20px_40px_rgba(5,150,105,0.3)]">
                        {{ authStore.token ? 'Ir a mi Panel' : 'Empezar Gratis' }}
                        <ChevronRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </RouterLink>
                </div>
            </div>
        </section>

        <!-- NEW: INTERACTIVE BENTO GRID -->
        <section id="features" class="py-40 px-8 relative bg-accent/20 transition-colors duration-500">
            <div class="max-w-[1400px] mx-auto space-y-20">
                <div class="text-center space-y-6 reveal reveal-up">
                    <h2 class="text-6xl font-black uppercase">BAR <span class="text-primary italic">INTELLIGENCE</span></h2>
                    <p class="text-foreground/40 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[10px]">Un ecosistema completo diseñado para la excelencia operativa.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div v-for="(f, i) in features" :key="i" 
                         class="reveal reveal-up p-10 bg-card border border-border rounded-[3rem] hover:border-primary transition-all group relative overflow-hidden"
                         :style="{ transitionDelay: (i * 150) + 'ms' }">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all"></div>
                        <component :is="f.icon" class="w-12 h-12 mb-8 group-hover:scale-110 transition-transform" :class="f.color" />
                        <h3 class="text-2xl font-black mb-4 uppercase italic">{{ f.title }}</h3>
                        <p class="text-foreground/40 text-sm font-medium leading-relaxed tracking-normal lowercase first-letter:uppercase">{{ f.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- PRODUCT SHOWCASE (CLEAN & MODERN) -->
        <section class="py-40 px-8 bg-background border-y border-border relative">
             <div class="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 items-center">
                <div class="reveal reveal-left space-y-12 order-2 lg:order-1">
                    <div class="space-y-4">
                        <h2 class="text-5xl md:text-7xl font-black leading-none uppercase italic">
                            GESTIÓN <br/> 
                            <span class="text-primary not-italic tracking-tighter">SIN ESFUERZO.</span>
                        </h2>
                        <div class="h-1 w-24 bg-primary"></div>
                    </div>
                    <p class="text-xl text-foreground/50 leading-relaxed font-medium">
                        Olvídate de las hojas de cálculo. Centraliza todo tu negocio en un dashboard intuitivo, accesible desde cualquier dispositivo, en cualquier momento.
                    </p>
                    <div class="flex items-center gap-12 pt-4">
                        <div class="space-y-2">
                            <span class="text-4xl font-black text-foreground">100%</span>
                            <p class="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Cloud Sync</p>
                        </div>
                         <div class="space-y-2">
                            <span class="text-4xl font-black text-foreground">24/7</span>
                            <p class="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Monitorización</p>
                        </div>
                    </div>
                </div>
                <div class="reveal reveal-right relative group order-1 lg:order-2">
                    <div class="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=2070" 
                         class="w-full h-auto rounded-[3.5rem] shadow-2xl grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000" />
                </div>
            </div>
        </section>

        <!-- PRICING -->
        <section id="pricing" class="py-40 px-8 bg-accent/10">
            <div class="max-w-[1400px] mx-auto space-y-24">
                <div class="text-center space-y-6 reveal reveal-up">
                    <h2 class="text-6xl font-black uppercase text-foreground">PLANES <span class="text-primary italic">ELITE</span></h2>
                    <p class="text-foreground/40 max-w-2xl mx-auto font-black uppercase tracking-widest text-[10px]">Simple, transparente y escalable.</p>
                </div>

                <div class="grid lg:grid-cols-3 gap-8">
                    <div v-for="(plan, idx) in pricing" :key="idx" 
                        class="reveal reveal-up p-12 rounded-[4rem] border border-border bg-card flex flex-col justify-between hover:scale-[1.02] transition-all shadow-xl"
                        :class="idx === 1 ? 'border-primary ring-1 ring-primary/20 scale-105 z-10' : ''">
                        <div class="space-y-10">
                            <div class="space-y-2">
                                <span v-if="idx === 1" class="text-[9px] font-black text-primary uppercase tracking-[0.4em]">EL FAVORITO</span>
                                <h4 class="text-2xl font-black uppercase tracking-tight">{{ plan.name }}</h4>
                            </div>
                            <div class="text-6xl font-black italic tracking-tighter">{{ plan.price }}<span v-if="idx < 2" class="text-xl font-bold not-italic text-foreground/20">/mes</span></div>
                            <ul class="space-y-4">
                                <li v-for="feat in plan.features" :key="feat" class="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-foreground/60">
                                    <CheckCircle2 class="w-4 h-4 text-primary" />
                                    {{ feat }}
                                </li>
                            </ul>
                        </div>
                        <button class="w-full mt-12 py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all"
                                :class="idx === 1 ? 'bg-primary text-white dark:text-black shadow-xl shadow-primary/20' : 'bg-accent text-foreground hover:bg-accent/80'">
                            Saber Más
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="py-32 px-8 border-t border-border bg-card transition-colors duration-500">
            <div class="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-20">
                <div class="col-span-2 space-y-10">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <Wine class="w-6 h-6 text-white" />
                        </div>
                        <span class="text-2xl font-black tracking-tighter uppercase">Bar<span class="text-primary">Flow</span></span>
                    </div>
                    <p class="text-foreground/30 max-w-sm font-black uppercase text-[10px] tracking-[0.4em] leading-relaxed">
                        Redefiniendo la hostelería con tecnología de vanguardia.
                    </p>
                </div>
                <div class="space-y-8">
                    <h5 class="text-[9px] font-black uppercase tracking-[0.5em] text-foreground/20">Plataforma</h5>
                    <ul class="space-y-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                        <li><a href="#features" class="hover:text-primary transition-colors">Features</a></li>
                        <li><a href="#pricing" class="hover:text-primary transition-colors">Pricing</a></li>
                    </ul>
                </div>
                <div class="space-y-8">
                    <h5 class="text-[9px] font-black uppercase tracking-[0.5em] text-foreground/20">Soporte</h5>
                    <ul class="space-y-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                        <li><a href="#" class="hover:text-primary transition-colors">Help Center</a></li>
                        <li><a href="#" class="hover:text-primary transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div class="max-w-[1400px] mx-auto mt-20 pt-10 border-t border-border flex justify-between items-center">
                <span class="text-[9px] font-black text-foreground/10 uppercase tracking-[0.5em]">© 2026 BARFLOW SAAS. ALL RIGHTS RESERVED.</span>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.reveal { opacity: 0; transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1); }
.reveal-up { transform: translateY(50px); }
.reveal-down { transform: translateY(-50px); }
.reveal-left { transform: translateX(-50px); }
.reveal-right { transform: translateX(50px); }
.reveal.reveal-active { opacity: 1; transform: translate(0, 0); }

@keyframes pulse-slow {
    0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.15; }
    50% { transform: scale(1.05) translate(-50%, -50%); opacity: 0.25; }
}
.animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }

::-webkit-scrollbar { width: 0px; }
</style>
