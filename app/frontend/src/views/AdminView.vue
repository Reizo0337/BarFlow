<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { 
  Settings, 
  Users, 
  Printer, 
  Smartphone, 
  Palette,
  ChevronRight,
  Save,
  CheckCircle2,
  UserPlus,
  Search,
  ArrowLeft
} from 'lucide-vue-next'
import api from '@/services/api'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'
import AppDialog from '@/components/ui/AppDialog.vue'

// Components
import FiscalConfig from '@/components/admin/FiscalConfig.vue'
import EmployeeManagement from '@/components/admin/EmployeeManagement.vue'
import EmployeeModal from '@/components/admin/EmployeeModal.vue'

const uiStore = useUIStore()
const router = useRouter()

const activeSection = ref('general')
const isLoading = ref(false)
const showSuccess = ref(false)

const sections = [
  { id: 'general', name: 'Fiscal y Sistema', icon: Settings, description: 'Configuración de datos legales, moneda e impuestos.' },
  { id: 'users', name: 'Empleados', icon: Users, description: 'Gestión de personal, permisos y claves PIN.' },
  { id: 'devices', name: 'Dispositivos', icon: Smartphone, description: 'Configuración de comanderos y terminales.' },
  { id: 'printers', name: 'Impresoras', icon: Printer, description: 'Configuración de tickets y zonas de impresión.' },
  { id: 'appearance', name: 'Apariencia', icon: Palette, description: 'Personalización de colores, logos y temas.' },
]

// --- State ---
const config = ref({
  legalName: '',
  nif: '',
  address: '',
  phone: '',
  currency: '€',
  vatRate: 10,
  nextInvoiceNumber: 1
})

const employees = ref<any[]>([])
const isEmployeeModalOpen = ref(false)
const editingEmployee = ref<any>(null)

// Dialog State
const dialog = ref({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as any,
    onConfirm: () => {}
})

// --- Methods ---
const fetchSettings = async () => {
    try {
        const response = await api.get('/companies/settings')
        if (response.data) config.value = { ...config.value, ...response.data }
    } catch (error) { console.error('Error fetching settings:', error) }
}

const saveSettings = async () => {
    isLoading.value = true
    try {
        await api.patch('/companies/settings', config.value)
        triggerSuccess()
    } catch (error) { console.error('Error saving settings:', error) }
    finally { isLoading.value = false }
}

const fetchEmployees = async () => {
    try {
        const response = await api.get('/users')
        employees.value = response.data
    } catch (error) { console.error('Error fetching employees:', error) }
}

const triggerSuccess = () => {
    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 3000)
}

const handleEmployeeSave = async (formData: any) => {
    isLoading.value = true
    try {
        if (editingEmployee.value) {
            const payload = { ...formData }
            if (!payload.pin) delete payload.pin
            await api.patch(`/users/${editingEmployee.value.id}`, payload)
        } else {
            await api.post('/users', formData)
        }
        await fetchEmployees()
        isEmployeeModalOpen.value = false
        triggerSuccess()
    } catch (error) { console.error('Error saving employee:', error) }
    finally { isLoading.value = false }
}

const deleteEmployee = async (id: number) => {
    dialog.value = {
        isOpen: true,
        title: 'Eliminar Empleado',
        message: '¿Estás seguro de que deseas eliminar a este empleado? Esta acción no se puede deshacer.',
        type: 'confirm',
        onConfirm: async () => {
            try {
                await api.delete(`/users/${id}`)
                await fetchEmployees()
                dialog.value.isOpen = false
            } catch (error) { 
                console.error('Error deleting employee:', error)
                dialog.value.type = 'error'
                dialog.value.message = 'No se pudo eliminar al empleado.'
            }
        }
    }
}

const openEditEmployee = (emp: any) => {
    editingEmployee.value = emp
    isEmployeeModalOpen.value = true
}

const openAddEmployee = () => {
    editingEmployee.value = null
    isEmployeeModalOpen.value = true
}

watch(activeSection, (newSection) => {
    if (newSection === 'users') fetchEmployees()
    if (newSection === 'general') fetchSettings()
}, { immediate: true })

onMounted(() => {
    uiStore.toggleSidebarHidden(true)
})

onUnmounted(() => {
    uiStore.toggleSidebarHidden(false)
})
</script>

<template>
  <div class="h-screen w-full bg-background flex flex-col p-6 md:p-12 gap-8 animate-in fade-in duration-500 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <button @click="router.push('/app/dashboard')" class="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-foreground/40 hover:bg-primary hover:text-white transition-all shadow-sm group">
            <ArrowLeft class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
            <h1 class="text-4xl font-black tracking-tighter text-foreground uppercase">Panel de Control</h1>
            <p class="text-foreground/50 font-bold">Administración centralizada de BarFlow.</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <transition name="fade">
            <span v-if="showSuccess" class="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-full">
                <CheckCircle2 class="w-4 h-4" /> Éxito
            </span>
        </transition>
        <button v-if="activeSection === 'general'" @click="saveSettings" :disabled="isLoading" class="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50">
            <Save v-if="!isLoading" class="w-5 h-5" />
            <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Guardar
        </button>
        <button v-if="activeSection === 'users'" @click="openAddEmployee" class="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl transition-all">
            <UserPlus class="w-5 h-5" /> Nuevo Empleado
        </button>
      </div>
    </div>

    <div class="flex-1 flex gap-6 min-h-0">
      <aside class="w-80 flex flex-col gap-2 overflow-y-auto no-scrollbar pr-2">
        <button v-for="section in sections" :key="section.id" @click="activeSection = section.id" class="flex items-center gap-4 p-4 rounded-3xl border transition-all text-left group" :class="activeSection === section.id ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' : 'bg-card border-border hover:bg-accent/30'">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors" :class="activeSection === section.id ? 'bg-white/20' : 'bg-primary/10 text-primary'">
            <component :is="section.icon" class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <h3 class="font-black text-sm uppercase tracking-wider">{{ section.name }}</h3>
            <p class="text-[10px] font-medium leading-tight line-clamp-2" :class="activeSection === section.id ? 'text-white/60' : 'text-foreground/40'">{{ section.description }}</p>
          </div>
          <ChevronRight class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </aside>

      <main class="flex-1 bg-card rounded-[2.5rem] border border-border shadow-xl overflow-hidden flex flex-col relative">
        <div class="p-8 border-b border-border bg-accent/5 flex items-center justify-between">
          <h2 class="text-2xl font-black uppercase text-primary tracking-widest">{{ sections.find(s => s.id === activeSection)?.name }}</h2>
          <div v-if="activeSection === 'users'" class="relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input type="text" placeholder="Buscar..." class="bg-accent/20 border-none rounded-xl pl-10 pr-4 py-2 text-sm font-bold outline-none focus:ring-2 transition-all">
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <FiscalConfig v-if="activeSection === 'general'" :config="config" />
          <EmployeeManagement v-else-if="activeSection === 'users'" :employees="employees" @edit="openEditEmployee" @delete="deleteEmployee" @add="openAddEmployee" />
          <div v-else class="h-full flex flex-col items-center justify-center text-foreground/20 italic space-y-4">
            <div class="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center border-4 border-dashed border-border">
              <component :is="sections.find(s => s.id === activeSection)?.icon" class="w-8 h-8 opacity-20" />
            </div>
            <p>Sección en desarrollo.</p>
          </div>
        </div>
      </main>
    </div>

    <EmployeeModal :is-open="isEmployeeModalOpen" :editing-employee="editingEmployee" :is-loading="isLoading" @close="isEmployeeModalOpen = false" @save="handleEmployeeSave" />
    
    <AppDialog 
        :is-open="dialog.isOpen"
        :title="dialog.title"
        :message="dialog.message"
        :type="dialog.type"
        @confirm="dialog.onConfirm"
        @close="dialog.isOpen = false"
        @cancel="dialog.isOpen = false"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
