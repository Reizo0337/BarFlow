<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
    Clock, 
    Calendar, 
    User as UserIcon, 
    Edit3, 
    CheckCircle2, 
    AlertCircle,
    History,
    Search,
    ChevronDown
} from 'lucide-vue-next'
import api from '@/services/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'

const shifts = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const fetchShifts = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/shifts/company')
        shifts.value = response.data
    } catch (error) {
        console.error('Error fetching shifts:', error)
    } finally {
        isLoading.value = false
    }
}

const filteredShifts = computed(() => {
    if (!searchQuery.value) return shifts.value
    const q = searchQuery.value.toLowerCase()
    return shifts.value.filter(s => 
        s.user?.name.toLowerCase().includes(q) || 
        new Date(s.startTime).toLocaleDateString().includes(q)
    )
})

const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'En curso...'
    const diff = new Date(end).getTime() - new Date(start).getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m`
}

// Edit State
const isEditModalOpen = ref(false)
const editingShift = ref<any>(null)
const editForm = ref({
    startTime: '',
    endTime: '',
    justification: ''
})

const openEdit = (shift: any) => {
    editingShift.value = shift
    editForm.value = {
        startTime: new Date(shift.startTime).toISOString().slice(0, 16),
        endTime: shift.endTime ? new Date(shift.endTime).toISOString().slice(0, 16) : '',
        justification: ''
    }
    isEditModalOpen.value = true
}

const saveEdit = async () => {
    if (!editForm.value.justification) return
    
    try {
        await api.patch(`/shifts/${editingShift.value.id}`, editForm.value)
        await fetchShifts()
        isEditModalOpen.value = false
    } catch (error) {
        console.error('Error updating shift:', error)
    }
}

onMounted(fetchShifts)
</script>

<template>
    <div class="space-y-6">
        <!-- Stats Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-accent/10 p-6 rounded-[2rem] border border-border">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <History class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40">Total Registros</p>
                        <p class="text-2xl font-black">{{ shifts.length }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-accent/10 p-6 rounded-[2rem] border border-border">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40">Activos Ahora</p>
                        <p class="text-2xl font-black text-emerald-500">{{ shifts.filter(s => s.isActive).length }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-accent/10 p-6 rounded-[2rem] border border-border">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <AlertCircle class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40">Editados</p>
                        <p class="text-2xl font-black text-amber-500">{{ shifts.filter(s => s.justification).length }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter & Search -->
        <div class="flex items-center gap-4 bg-accent/5 p-2 rounded-2xl border border-border">
            <div class="relative flex-1">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Buscar por empleado o fecha..." 
                    class="w-full bg-transparent border-none pl-12 pr-4 py-3 text-sm font-bold outline-none"
                >
            </div>
        </div>

        <!-- Shifts Table -->
        <div class="bg-card rounded-3xl border border-border overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-accent/10">
                    <tr>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Empleado</th>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Fecha</th>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Entrada / Salida</th>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Total</th>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border/50">
                    <tr v-for="shift in filteredShifts" :key="shift.id" class="hover:bg-accent/5 transition-colors group">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                                    {{ shift.user?.name.charAt(0) }}
                                </div>
                                <div>
                                    <p class="font-black text-sm">{{ shift.user?.name }}</p>
                                    <p class="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">{{ shift.user?.role }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2 text-sm font-bold">
                                <Calendar class="w-4 h-4 text-foreground/20" />
                                {{ new Date(shift.startTime).toLocaleDateString() }}
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex flex-col gap-1">
                                <div class="flex items-center gap-2 text-[10px] font-black">
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    {{ new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                                </div>
                                <div class="flex items-center gap-2 text-[10px] font-black" :class="shift.endTime ? 'text-foreground/40' : 'text-primary animate-pulse'">
                                    <div class="w-1.5 h-1.5 rounded-full" :class="shift.endTime ? 'bg-amber-500' : 'bg-primary'"></div>
                                    {{ shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Trabajando...' }}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full bg-accent/20 text-xs font-black">
                                {{ formatDuration(shift.startTime, shift.endTime) }}
                            </span>
                            <div v-if="shift.justification" class="mt-1 flex items-center gap-1 text-[8px] text-amber-500 font-black uppercase">
                                <AlertCircle class="w-2.5 h-2.5" /> Editado
                            </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button 
                                @click="openEdit(shift)"
                                class="p-2 rounded-lg hover:bg-primary/10 text-foreground/20 hover:text-primary transition-all active:scale-90"
                            >
                                <Edit3 class="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="filteredShifts.length === 0" class="p-12 text-center text-foreground/20 italic">
                No se han encontrado registros de jornada.
            </div>
        </div>

        <!-- Edit Modal -->
        <AppDialog :is-open="isEditModalOpen" title="Editar Jornada Laboral" @close="isEditModalOpen = false">
            <div class="space-y-6">
                <div class="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
                    <AlertCircle class="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <p class="text-xs font-bold text-amber-700 leading-relaxed">
                        Estás modificando un registro de tiempo. Por motivos de auditoría laboral, es obligatorio incluir una justificación clara de por qué se realiza este cambio.
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Entrada</label>
                        <input v-model="editForm.startTime" type="datetime-local" class="w-full bg-accent/10 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Salida</label>
                        <input v-model="editForm.endTime" type="datetime-local" class="w-full bg-accent/10 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Justificación (Obligatoria)</label>
                    <textarea 
                        v-model="editForm.justification" 
                        rows="3" 
                        class="w-full bg-accent/10 border-none rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="Ej: El empleado olvidó marcar la salida al terminar su turno..."
                    ></textarea>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-4 w-full">
                    <BaseButton variant="secondary" @click="isEditModalOpen = false" class="flex-1">Cancelar</BaseButton>
                    <BaseButton 
                        variant="primary" 
                        @click="saveEdit" 
                        :disabled="!editForm.justification || !editForm.startTime"
                        class="flex-[2]"
                    >
                        Guardar Cambios
                    </BaseButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
