<script setup lang="ts">
import { ref } from 'vue'
import { 
  Settings, 
  Users, 
  Printer, 
  Database, 
  Smartphone, 
  Shield, 
  Bell, 
  Palette,
  ChevronRight,
  Save
} from 'lucide-vue-next'

const activeSection = ref('general')

const sections = [
  { id: 'general', name: 'General', icon: Settings, description: 'Configuración básica del establecimiento y sistema.' },
  { id: 'users', name: 'Empleados', icon: Users, description: 'Gestión de personal, permisos y turnos.' },
  { id: 'devices', name: 'Dispositivos', icon: Smartphone, description: 'Configuración de comanderos y terminales.' },
  { id: 'printers', name: 'Impresoras', icon: Printer, description: 'Configuración de tickets y zonas de impresión (Barra, Cocina).' },
  { id: 'appearance', name: 'Apariencia', icon: Palette, description: 'Personalización de colores, logos y temas.' },
  { id: 'security', name: 'Seguridad', icon: Shield, description: 'Copias de seguridad y logs de auditoría.' },
  { id: 'notifications', name: 'Notificaciones', icon: Bell, description: 'Alertas de stock, pedidos y avisos de mesa.' },
]

const config = ref({
  businessName: 'BarFlow Premium',
  taxId: 'B-12345678',
  address: 'Calle Falsa 123, Madrid',
  currency: 'EUR',
  autoLogout: true,
  autoLogoutTime: 5,
  soundEnabled: true,
})
</script>

<template>
  <div class="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground uppercase">Panel de Control</h1>
        <p class="text-foreground/50 font-bold">Administración centralizada de todo el ecosistema BarFlow.</p>
      </div>
      <button class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
        <Save class="w-5 h-5" />
        Guardar Cambios
      </button>
    </div>

    <div class="flex-1 flex gap-6 min-h-0">
      <!-- Navigation Sidebar -->
      <aside class="w-80 flex flex-col gap-2 overflow-y-auto no-scrollbar pr-2">
        <button 
          v-for="section in sections" 
          :key="section.id"
          @click="activeSection = section.id"
          class="flex items-center gap-4 p-4 rounded-3xl border transition-all text-left group"
          :class="activeSection === section.id 
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
            : 'bg-card border-border hover:border-primary/50 hover:bg-accent/30'"
        >
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
            :class="activeSection === section.id ? 'bg-white/20' : 'bg-primary/10 text-primary'"
          >
            <component :is="section.icon" class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <h3 class="font-black text-sm uppercase tracking-wider">{{ section.name }}</h3>
            <p 
              class="text-[10px] font-medium leading-tight line-clamp-2"
              :class="activeSection === section.id ? 'text-white/60' : 'text-foreground/40'"
            >
              {{ section.description }}
            </p>
          </div>
          <ChevronRight class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </aside>

      <!-- Main Config Area -->
      <main class="flex-1 bg-card rounded-[2.5rem] border border-border shadow-xl overflow-hidden flex flex-col relative">
        <div class="p-8 border-b border-border bg-accent/5">
          <h2 class="text-2xl font-black uppercase text-primary tracking-widest">{{ sections.find(s => s.id === activeSection)?.name }}</h2>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <!-- General Section Content -->
          <div v-if="activeSection === 'general'" class="space-y-6 max-w-2xl">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Nombre del Negocio</label>
                <input v-model="config.businessName" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">CIF/NIF</label>
                <input v-model="config.taxId" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Dirección Fiscal</label>
              <input v-model="config.address" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
            </div>

            <div class="grid grid-cols-2 gap-6 pt-4">
              <div class="flex items-center justify-between p-4 bg-accent/10 rounded-2xl border border-border">
                <div>
                  <p class="font-bold text-sm">Cierre de Sesión Automático</p>
                  <p class="text-[10px] text-foreground/40 italic">Inactividad tras {{ config.autoLogoutTime }} min</p>
                </div>
                <button 
                  @click="config.autoLogout = !config.autoLogout"
                  class="w-12 h-6 rounded-full transition-colors relative"
                  :class="config.autoLogout ? 'bg-primary' : 'bg-foreground/20'"
                >
                  <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" :style="{ left: config.autoLogout ? '1.75rem' : '0.25rem' }"></div>
                </button>
              </div>

              <div class="flex items-center justify-between p-4 bg-accent/10 rounded-2xl border border-border">
                <div>
                  <p class="font-bold text-sm">Sonidos del Sistema</p>
                  <p class="text-[10px] text-foreground/40 italic">Habilitar avisos sonoros</p>
                </div>
                <button 
                  @click="config.soundEnabled = !config.soundEnabled"
                  class="w-12 h-6 rounded-full transition-colors relative"
                  :class="config.soundEnabled ? 'bg-primary' : 'bg-foreground/20'"
                >
                  <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" :style="{ left: config.soundEnabled ? '1.75rem' : '0.25rem' }"></div>
                </button>
              </div>
            </div>
          </div>

          <!-- Other sections placeholders -->
          <div v-else class="h-full flex flex-col items-center justify-center text-foreground/20 italic space-y-4">
            <div class="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center border-4 border-dashed border-border">
              <component :is="sections.find(s => s.id === activeSection)?.icon" class="w-8 h-8 opacity-20" />
            </div>
            <p>La configuración de {{ sections.find(s => s.id === activeSection)?.name }} estará disponible pronto.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
