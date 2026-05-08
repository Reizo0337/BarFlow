<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { 
    BarChart3, 
    ShieldCheck, 
    Zap, 
    ChevronRight, 
    Wine, 
    Users, 
    ArrowRight 
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
    <div class="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white overflow-x-hidden">
        <!-- Navigation -->
        <nav class="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
            <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Wine class="w-6 h-6 text-white" />
                    </div>
                    <span class="text-2xl font-black tracking-tighter uppercase">Bar<span class="text-primary">Flow</span></span>
                </div>
                <div class="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/60">
                    <a href="#features" class="hover:text-white transition-colors">Características</a>
                    <a href="#" class="hover:text-white transition-colors">Precios</a>
                    <RouterLink :to="authStore.token ? '/app/dashboard' : '/portal'" class="px-6 py-3 bg-white text-black rounded-full hover:bg-primary hover:text-white transition-all transform active:scale-95">
                        {{ authStore.token ? 'Ir al Panel' : 'Acceso Clientes' }}
                    </RouterLink>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="relative pt-40 pb-20 px-6">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10"></div>
            
            <div class="max-w-5xl mx-auto text-center space-y-8">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-primary animate-bounce">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    El futuro de la gestión hostelera
                </div>
                
                <h1 class="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
                    Tu bar, bajo control. <br/> En cualquier sitio.
                </h1>
                
                <p class="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-medium">
                    Gestiona inventarios, personal y ventas en tiempo real con la plataforma SaaS más avanzada para restauración.
                </p>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                    <RouterLink :to="authStore.token ? '/app/dashboard' : '/portal'" class="group flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/40">
                        {{ authStore.token ? 'Ir a mi Panel' : 'Empezar Ahora' }}
                        <ChevronRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </RouterLink>
                    <button v-if="!authStore.token" class="px-10 py-5 border border-white/10 rounded-full font-black text-xl hover:bg-white/5 transition-all">
                        Ver Demo
                    </button>
                </div>
            </div>
            
            <!-- Floating Mockup -->
            <div class="mt-20 max-w-6xl mx-auto relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div class="relative bg-[#111] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=2070" 
                         alt="Dashboard Preview" 
                         class="w-full h-auto opacity-80" />
                </div>
            </div>
        </section>

        <!-- Features Grid -->
        <section id="features" class="max-w-7xl mx-auto px-6 py-32">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div class="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all group">
                    <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                        <Zap class="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 class="text-2xl font-black mb-4">Rapidez Total</h3>
                    <p class="text-white/40 leading-relaxed font-medium">Interfaz táctil optimizada para que tus pedidos fluyan sin esperas. Cada segundo cuenta en la cocina.</p>
                </div>

                <div class="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all group">
                    <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                        <Users class="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 class="text-2xl font-black mb-4">Multi-Empresa</h3>
                    <p class="text-white/40 leading-relaxed font-medium">Configura múltiples locales bajo una sola cuenta. Controla a tus empleados con códigos individuales.</p>
                </div>

                <div class="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all group">
                    <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                        <BarChart3 class="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 class="text-2xl font-black mb-4">Análisis Real</h3>
                    <p class="text-white/40 leading-relaxed font-medium">Estadísticas detalladas de ventas e inventario. Toma decisiones basadas en datos, no en intuiciones.</p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-white/5 py-12">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:row justify-between items-center gap-8">
                 <div class="flex items-center gap-3">
                    <Wine class="w-6 h-6 text-primary" />
                    <span class="text-xl font-black tracking-tighter uppercase">Bar<span class="text-primary">Flow</span></span>
                </div>
                <p class="text-white/20 text-sm font-bold uppercase tracking-widest">© 2026 BarFlow SaaS - Revolucionando la Hostelería</p>
                <div class="flex gap-6 text-white/40 text-xs font-bold uppercase tracking-widest">
                    <a href="#" class="hover:text-white transition-colors">Privacidad</a>
                    <a href="#" class="hover:text-white transition-colors">Términos</a>
                    <a href="#" class="hover:text-white transition-colors">Contacto</a>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.bg-primary {
    background-color: #00DBB7; /* Vibrant Teal */
}
.text-primary {
    color: #00DBB7;
}
.shadow-primary\/40 {
    shadow-color: rgba(0, 219, 183, 0.4);
}
</style>
