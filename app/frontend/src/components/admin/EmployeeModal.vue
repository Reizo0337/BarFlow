<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Key } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  editingEmployee: any
  isLoading: boolean
}>()

const emit = defineEmits(['close', 'save'])

const employeeForm = ref({
    name: '',
    role: 'waiter',
    pin: '',
    avatar: ''
})

watch(() => props.isOpen, (val) => {
    if (val) {
        if (props.editingEmployee) {
            employeeForm.value = {
                name: props.editingEmployee.name,
                role: props.editingEmployee.role,
                pin: '',
                avatar: props.editingEmployee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.editingEmployee.name}`
            }
        } else {
            employeeForm.value = {
                name: '',
                role: 'waiter',
                pin: '',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
            }
        }
    }
})

const handleSave = () => {
    emit('save', { ...employeeForm.value })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div class="bg-card w-full max-w-lg rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div class="p-8 lg:p-10 space-y-8">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-3xl font-black">{{ editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
            <p class="text-foreground/40 font-bold">Configura el acceso y perfil del personal.</p>
          </div>
          <button @click="emit('close')" class="p-3 hover:bg-accent/50 rounded-2xl transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-8">
          <div class="flex flex-col items-center gap-4">
            <div class="w-32 h-32 rounded-3xl bg-accent/20 p-2 border-2 border-border overflow-hidden">
              <img :src="employeeForm.avatar" class="w-full h-full object-cover">
            </div>
            <button @click="employeeForm.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`" class="text-[10px] font-black uppercase text-primary hover:underline">
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
                <button @click="employeeForm.role = 'waiter'" class="py-3 rounded-xl font-black text-xs transition-all border-2" :class="employeeForm.role === 'waiter' ? 'bg-primary/10 border-primary text-primary' : 'bg-accent/10 border-transparent text-foreground/40'">Camarero</button>
                <button @click="employeeForm.role = 'admin'" class="py-3 rounded-xl font-black text-xs transition-all border-2" :class="employeeForm.role === 'admin' ? 'bg-primary/10 border-primary text-primary' : 'bg-accent/10 border-transparent text-foreground/40'">Admin</button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">PIN de Acceso</label>
              <div class="relative">
                <Key class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                <input v-model="employeeForm.pin" type="password" maxlength="6" class="w-full bg-accent/10 border-none rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="****">
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 flex gap-4">
          <button @click="emit('close')" class="flex-1 py-4 bg-accent/20 rounded-2xl font-black hover:bg-accent/30 transition-all">Cancelar</button>
          <button @click="handleSave" :disabled="isLoading || !employeeForm.name" class="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {{ isLoading ? 'Guardando...' : 'Guardar Empleado' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
