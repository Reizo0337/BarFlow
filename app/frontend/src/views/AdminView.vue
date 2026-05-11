<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  Save,
  Building2,
  Hash,
  MapPin,
  Phone,
  Coins,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next'
import api from '@/services/api'

const activeSection = ref('general')
const isLoading = ref(false)
const showSuccess = ref(false)

const sections = [
  { id: 'general', name: 'Fiscal y Sistema', icon: Settings, description: 'Configuración de datos legales, moneda e impuestos.' },
  { id: 'users', name: 'Empleados', icon: Users, description: 'Gestión de personal, permisos y turnos.' },
  { id: 'devices', name: 'Dispositivos', icon: Smartphone, description: 'Configuración de comanderos y terminales.' },
  { id: 'printers', name: 'Impresoras', icon: Printer, description: 'Configuración de tickets y zonas de impresión.' },
  { id: 'appearance', name: 'Apariencia', icon: Palette, description: 'Personalización de colores, logos y temas.' },
]

const config = ref({
  legalName: '',
  nif: '',
  address: '',
  phone: '',
  currency: '€',
  vatRate: 10,
  nextInvoiceNumber: 1
})

const fetchSettings = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/companies/settings')
        if (response.data) {
            config.value = { ...config.value, ...response.data }
        }
    } catch (error) {
        console.error('Error fetching settings:', error)
    } finally {
        isLoading.value = false
    }
}

const saveSettings = async () => {
    isLoading.value = true
    try {
        await api.patch('/companies/settings', config.value)
        showSuccess.value = true
        setTimeout(() => showSuccess.value = false, 3000)
    } catch (error) {
        console.error('Error saving settings:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchSettings)
</script>

<template>
  <div class="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground uppercase">Panel de Control</h1>
        <p class="text-foreground/50 font-bold">Administración centralizada de todo el ecosistema BarFlow.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <transition name="fade">
            <span v-if="showSuccess" class="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-full">
                <CheckCircle2 class="w-4 h-4" /> Guardado correctamente
            </span>
        </transition>
        <button 
            @click="saveSettings"
            :disabled="isLoading"
            class="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
        >
            <Save v-if="!isLoading" class="w-5 h-5" />
            <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
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
          <!-- General Section Content (Fiscal & System) -->
          <div v-if="activeSection === 'general'" class="space-y-10">
            <!-- Emisor Info -->
            <div class="space-y-6">
                <div class="flex items-center gap-3 px-2">
                    <Building2 class="w-5 h-5 text-primary" />
                    <h3 class="font-black text-xs uppercase tracking-[0.2em] text-foreground/30">Identificación Fiscal</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Razón Social / Propietario</label>
                        <input v-model="config.legalName" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Nombre completo">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">NIF / CIF</label>
                        <input v-model="config.nif" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="B12345678">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Teléfono de Contacto</label>
                        <input v-model="config.phone" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="+34 600 000 000">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Dirección Fiscal</label>
                        <input v-model="config.address" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Domicilio completo">
                    </div>
                </div>
            </div>

            <!-- Tax & Currency -->
            <div class="space-y-6">
                <div class="flex items-center gap-3 px-2">
                    <Coins class="w-5 h-5 text-indigo-500" />
                    <h3 class="font-black text-xs uppercase tracking-[0.2em] text-foreground/30">Impuestos y Moneda</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Moneda del Sistema</label>
                        <div class="grid grid-cols-2 gap-2 bg-accent/10 p-1 rounded-2xl">
                            <button @click="config.currency = '€'" :class="config.currency === '€' ? 'bg-white text-primary shadow-sm' : 'text-foreground/40'" class="py-2 rounded-xl font-black transition-all">€</button>
                            <button @click="config.currency = '$'" :class="config.currency === '$' ? 'bg-white text-primary shadow-sm' : 'text-foreground/40'" class="py-2 rounded-xl font-black transition-all">$</button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">IVA Aplicable (%)</label>
                        <div class="relative">
                            <Percent class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                            <input v-model.number="config.vatRate" type="number" step="0.1" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Próxima Factura #</label>
                        <div class="relative">
                            <Hash class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                            <input v-model.number="config.nextInvoiceNumber" type="number" class="w-full bg-accent/20 border-none rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                        </div>
                    </div>
                </div>

                <div class="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-start gap-4">
                    <AlertCircle class="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                    <p class="text-[10px] font-bold text-foreground/50 leading-relaxed">
                        Estos datos son obligatorios para que los tickets generados sean válidos legalmente. El número de factura se incrementará automáticamente después de cada venta realizada.
                    </p>
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
