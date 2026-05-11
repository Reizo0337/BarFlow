<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
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
  AlertCircle,
  Plus,
  Trash2,
  UserPlus,
  Key,
  ShieldAlert,
  Search,
  Pencil,
  X,
  ArrowLeft
} from 'lucide-vue-next'
import api from '@/services/api'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'

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

// --- Fiscal & System Config ---
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
    try {
        const response = await api.get('/companies/settings')
        if (response.data) {
            config.value = { ...config.value, ...response.data }
        }
    } catch (error) {
        console.error('Error fetching settings:', error)
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

// --- Employees Management ---
const employees = ref<any[]>([])
const isEmployeeModalOpen = ref(false)
const editingEmployee = ref<any>(null)
const employeeForm = ref({
    name: '',
    role: 'waiter',
    pin: '',
    avatar: ''
})

const fetchEmployees = async () => {
    try {
        const response = await api.get('/users')
        employees.value = response.data
    } catch (error) {
        console.error('Error fetching employees:', error)
    }
}

const openAddEmployee = () => {
    editingEmployee.value = null
    employeeForm.value = {
        name: '',
        role: 'waiter',
        pin: '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
    }
    isEmployeeModalOpen.value = true
}

const openEditEmployee = (emp: any) => {
    editingEmployee.value = emp
    employeeForm.value = {
        name: emp.name,
        role: emp.role,
        pin: '', // Pin remains hidden but can be updated
        avatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`
    }
    isEmployeeModalOpen.value = true
}

const saveEmployee = async () => {
    isLoading.value = true
    try {
        if (editingEmployee.value) {
            // Update
            const payload: any = { ...employeeForm.value }
            if (!payload.pin) delete payload.pin // Only update pin if provided
            await api.patch(`/users/${editingEmployee.value.id}`, payload)
        } else {
            // Create
            await api.post('/users', employeeForm.value)
        }
        await fetchEmployees()
        isEmployeeModalOpen.value = false
        showSuccess.value = true
        setTimeout(() => showSuccess.value = false, 3000)
    } catch (error) {
        console.error('Error saving employee:', error)
    } finally {
        isLoading.value = false
    }
}

const deleteEmployee = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar a este empleado? Perderá acceso al sistema.')) return
    try {
        await api.delete(`/users/${id}`)
        await fetchEmployees()
    } catch (error) {
        console.error('Error deleting employee:', error)
    }
}

// Watch section changes to fetch data
watch(activeSection, (newSection) => {
    if (newSection === 'users') fetchEmployees()
    if (newSection === 'general') fetchSettings()
}, { immediate: true })

onMounted(() => {
    fetchSettings()
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
        <button 
            @click="router.push('/app/dashboard')"
            class="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-foreground/40 hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-primary/20 group"
        >
            <ArrowLeft class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
            <h1 class="text-4xl font-black tracking-tighter text-foreground uppercase">Panel de Control</h1>
            <p class="text-foreground/50 font-bold">Administración centralizada de todo el ecosistema BarFlow.</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <transition name="fade">
            <span v-if="showSuccess" class="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-full">
                <CheckCircle2 class="w-4 h-4" /> Operación realizada con éxito
            </span>
        </transition>
        <button 
            v-if="activeSection === 'general'"
            @click="saveSettings"
            :disabled="isLoading"
            class="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
        >
            <Save v-if="!isLoading" class="w-5 h-5" />
            <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Guardar Cambios
        </button>
        <button 
            v-if="activeSection === 'users'"
            @click="openAddEmployee"
            class="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
        >
            <UserPlus class="w-5 h-5" />
            Nuevo Empleado
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
        <div class="p-8 border-b border-border bg-accent/5 flex items-center justify-between">
          <h2 class="text-2xl font-black uppercase text-primary tracking-widest">{{ sections.find(s => s.id === activeSection)?.name }}</h2>
          
          <div v-if="activeSection === 'users'" class="relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input type="text" placeholder="Buscar empleado..." class="bg-accent/20 border-none rounded-xl pl-10 pr-4 py-2 text-sm font-bold outline-none ring-primary/20 focus:ring-2 transition-all">
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          
          <!-- General Section: Fiscal & System -->
          <div v-if="activeSection === 'general'" class="space-y-10 animate-in fade-in duration-500">
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

          <!-- Employees Section -->
          <div v-else-if="activeSection === 'users'" class="space-y-6 animate-in fade-in duration-500">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div 
                    v-for="employee in employees" 
                    :key="employee.id"
                    class="bg-accent/10 border border-border rounded-[2rem] p-6 flex flex-col gap-4 group hover:border-primary/30 hover:bg-accent/20 transition-all"
                >
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-white p-1 shadow-sm overflow-hidden">
                            <img :src="employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-lg">{{ employee.name }}</h3>
                            <span 
                                class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                                :class="employee.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'"
                            >
                                {{ employee.role === 'admin' ? 'Administrador' : 'Camarero' }}
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 pt-2">
                        <button @click="openEditEmployee(employee)" class="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Pencil class="w-3 h-3" /> Editar
                        </button>
                        <button @click="deleteEmployee(employee.id)" class="w-12 flex items-center justify-center py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all shadow-sm">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Add Card -->
                <button 
                    @click="openAddEmployee"
                    class="border-4 border-dashed border-border rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-foreground/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                    <div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus class="w-8 h-8" />
                    </div>
                    <span class="font-black uppercase text-sm tracking-widest">Añadir Empleado</span>
                </button>
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

    <!-- Employee Modal -->
    <div v-if="isEmployeeModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div class="bg-card w-full max-w-lg rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-8 lg:p-10 space-y-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-3xl font-black">{{ editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
                        <p class="text-foreground/40 font-bold">Configura el acceso y perfil del personal.</p>
                    </div>
                    <button @click="isEmployeeModalOpen = false" class="p-3 hover:bg-accent/50 rounded-2xl transition-colors">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <div class="flex flex-col md:flex-row gap-8">
                    <!-- Avatar Preview -->
                    <div class="flex flex-col items-center gap-4">
                        <div class="w-32 h-32 rounded-3xl bg-accent/20 p-2 border-2 border-border overflow-hidden">
                            <img :src="employeeForm.avatar" class="w-full h-full object-cover">
                        </div>
                        <button 
                            @click="employeeForm.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`"
                            class="text-[10px] font-black uppercase text-primary hover:underline"
                        >
                            Cambiar Avatar
                        </button>
                    </div>

                    <div class="flex-1 space-y-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Nombre Completo</label>
                            <input v-model="employeeForm.name" class="w-full bg-accent/10 border-none rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ej: Maria García">
                        </div>

                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Rol de Usuario</label>
                            <div class="grid grid-cols-2 gap-3">
                                <button 
                                    @click="employeeForm.role = 'waiter'"
                                    class="py-3 rounded-xl font-black text-xs transition-all border-2"
                                    :class="employeeForm.role === 'waiter' ? 'bg-primary/10 border-primary text-primary' : 'bg-accent/10 border-transparent text-foreground/40'"
                                >
                                    Camarero
                                </button>
                                <button 
                                    @click="employeeForm.role = 'admin'"
                                    class="py-3 rounded-xl font-black text-xs transition-all border-2"
                                    :class="employeeForm.role === 'admin' ? 'bg-primary/10 border-primary text-primary' : 'bg-accent/10 border-transparent text-foreground/40'"
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">PIN de Acceso (4-6 dígitos)</label>
                            <div class="relative">
                                <Key class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                                <input v-model="employeeForm.pin" type="password" maxlength="6" class="w-full bg-accent/10 border-none rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="****">
                            </div>
                            <p v-if="editingEmployee" class="text-[10px] text-amber-600 font-bold italic px-2">Deja en blanco para mantener el PIN actual.</p>
                        </div>
                    </div>
                </div>

                <div class="pt-4 flex gap-4">
                    <button @click="isEmployeeModalOpen = false" class="flex-1 py-4 bg-accent/20 rounded-2xl font-black hover:bg-accent/30 transition-all">Cancelar</button>
                    <button 
                        @click="saveEmployee"
                        :disabled="isLoading || !employeeForm.name || (!editingEmployee && !employeeForm.pin)"
                        class="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {{ isLoading ? 'Guardando...' : 'Guardar Empleado' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
