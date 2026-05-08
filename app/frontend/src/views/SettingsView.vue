<script setup lang="ts">
import { ref } from 'vue'
import { 
  Building2, 
  Mail, 
  MapPin, 
  Globe, 
  CreditCard, 
  Clock,
  LayoutDashboard,
  Sun,
  Languages,
  Save
} from 'lucide-vue-next'

const settings = ref({
  name: 'BarFlow Premium',
  email: 'contacto@barflow.com',
  website: 'www.barflow.com',
  address: 'Avenida de la Constitución 1, Sevilla',
  language: 'Español',
  currency: 'EUR (€)',
  timezone: 'Madrid (GMT+1)',
  lowStockAlert: 10,
  enableTax: true,
  taxRate: 21,
})
</script>

<template>
  <div class="h-full space-y-8 animate-in fade-in duration-500">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground uppercase">Ajustes Generales</h1>
        <p class="text-foreground/50 font-bold">Configuración de identidad y preferencias globales.</p>
      </div>
      <button class="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all">
        <Save class="w-5 h-5" />
        Aplicar Cambios
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
      <!-- Establecimiento -->
      <section class="space-y-6">
        <div class="flex items-center gap-3 px-2">
          <Building2 class="w-5 h-5 text-primary" />
          <h2 class="font-black text-sm uppercase tracking-[0.2em] text-foreground/40">Establecimiento</h2>
        </div>
        
        <div class="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 leading-none">Nombre Comercial</label>
            <div class="relative group">
              <Building2 class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
              <input v-model="settings.name" class="w-full bg-accent/20 border-none rounded-2xl pl-12 pr-6 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all" placeholder="Nombre de tu negocio">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 leading-none">Email de contacto</label>
              <div class="relative group">
                <Mail class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input v-model="settings.email" type="email" class="w-full bg-accent/20 border-none rounded-2xl pl-12 pr-6 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 leading-none">Sitio Web</label>
              <div class="relative group">
                <Globe class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input v-model="settings.website" class="w-full bg-accent/20 border-none rounded-2xl pl-12 pr-6 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all">
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 leading-none">Dirección Física</label>
            <div class="relative group">
              <MapPin class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
              <input v-model="settings.address" class="w-full bg-accent/20 border-none rounded-2xl pl-12 pr-6 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all">
            </div>
          </div>
        </div>
      </section>

      <!-- Localización y Sistema -->
      <section class="space-y-6">
        <div class="flex items-center gap-3 px-2">
          <Languages class="w-5 h-5 text-indigo-500" />
          <h2 class="font-black text-sm uppercase tracking-[0.2em] text-foreground/40">Sistema</h2>
        </div>

        <div class="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 leading-none">Idioma del Sistema</label>
            <select v-model="settings.language" class="w-full bg-accent/20 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all appearance-none">
              <option>Español</option>
              <option>English</option>
              <option>Français</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 leading-none">Moneda Base</label>
              <input v-model="settings.currency" class="w-full bg-accent/20 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 leading-none">Zona Horaria</label>
              <input v-model="settings.timezone" class="w-full bg-accent/20 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all">
            </div>
          </div>

          <!-- Quick Switches -->
          <div class="pt-4 space-y-4">
            <div class="flex items-center justify-between p-5 bg-accent/10 rounded-2xl">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-black uppercase">Impuestos Habilitados</p>
                  <p class="text-[10px] font-bold text-foreground/40">Desglosar IVA en tickets ({{ settings.taxRate }}%)</p>
                </div>
              </div>
              <button 
                @click="settings.enableTax = !settings.enableTax"
                class="w-14 h-7 rounded-full transition-all relative"
                :class="settings.enableTax ? 'bg-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'bg-foreground/20'"
              >
                <div class="absolute top-1 w-5 h-5 bg-white rounded-full transition-all" :style="{ left: settings.enableTax ? '2rem' : '0.25rem' }"></div>
              </button>
            </div>

            <div class="flex items-center justify-between p-5 bg-accent/10 rounded-2xl">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <LayoutDashboard class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-black uppercase">Modo Simplificado</p>
                  <p class="text-[10px] font-bold text-foreground/40">Ocultar opciones avanzadas para camareros</p>
                </div>
              </div>
              <button class="w-14 h-7 rounded-full bg-foreground/20 relative">
                <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all"></div>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
