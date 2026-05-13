<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Users, UserPlus, Search, Phone, Mail, MapPin, Hash, Plus, X, Trash2, Edit2, ShoppingBag, Loader2, ArrowRight } from 'lucide-vue-next'
import api from '@/services/api'

// UI Kit
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import AppDialog from '@/components/ui/AppDialog.vue'

const clients = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const isModalOpen = ref(false)
const isHistoryModalOpen = ref(false)
const isSubmitting = ref(false)
const selectedClient = ref<any>(null)
const clientForm = ref({
    name: '',
    fiscalId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
})

onMounted(() => {
    fetchClients()
})

const fetchClients = async () => {
    isLoading.value = true
    try {
        const res = await api.get('/clients')
        clients.value = res.data
    } catch (e) { console.error(e) }
    finally { isLoading.value = false }
}

const filteredClients = computed(() => {
    if (!searchQuery.value) return clients.value
    const q = searchQuery.value.toLowerCase()
    return clients.value.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.fiscalId.toLowerCase().includes(q) ||
        c.phone.includes(q)
    )
})

const openAddModal = () => {
    selectedClient.value = null
    clientForm.value = {
        name: '',
        fiscalId: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: ''
    }
    isModalOpen.value = true
}

const openEditModal = (client: any) => {
    selectedClient.value = client
    clientForm.value = { ...client }
    isModalOpen.value = true
}

const handleSubmit = async () => {
    if (!clientForm.value.fiscalId || !clientForm.value.phone) {
        alert('Datos fiscales y Teléfono son obligatorios.')
        return
    }

    isSubmitting.value = true
    try {
        if (selectedClient.value) {
            await api.patch(`/clients/${selectedClient.value.id}`, clientForm.value)
        } else {
            await api.post('/clients', clientForm.value)
        }
        await fetchClients()
        isModalOpen.value = false
    } catch (e) { console.error(e) }
    finally { isSubmitting.value = false }
}

const deleteClient = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return
    try {
        await api.delete(`/clients/${id}`)
        await fetchClients()
    } catch (e) { console.error(e) }
}

const viewHistory = async (client: any) => {
    selectedClient.value = client
    isHistoryModalOpen.value = true
    // Detailed client info including invoices is fetched in ClientsService.findOne
    try {
        const res = await api.get(`/clients/${client.id}`)
        selectedClient.value = res.data
    } catch (e) { console.error(e) }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
    <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
                <h1 class="text-5xl font-black tracking-tighter text-foreground uppercase leading-none">Clientes</h1>
                <p class="text-foreground/40 font-bold italic mt-2">Gestión de cartera y facturación nominativa.</p>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="relative">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Buscar por nombre, NIF..." 
                        class="pl-11 pr-4 py-3 bg-accent/10 border border-border rounded-2xl text-sm font-bold focus:border-primary transition-all w-64"
                    />
                </div>
                <BaseButton variant="primary" @click="openAddModal">
                    <template #icon-left><Plus class="w-5 h-5" /></template>
                    Nuevo Cliente
                </BaseButton>
            </div>
        </div>

        <!-- Clients Grid -->
        <div v-if="isLoading" class="py-20 flex flex-col items-center gap-4 text-foreground/20 italic">
            <Loader2 class="w-12 h-12 animate-spin" />
            <p>Sincronizando clientes...</p>
        </div>

        <div v-else-if="filteredClients.length === 0" class="py-20 text-center bg-accent/5 rounded-[3rem] border border-dashed border-border">
            <Users class="w-16 h-16 text-foreground/10 mx-auto mb-4" />
            <p class="text-xl font-bold text-foreground/30 italic">No hay clientes que coincidan con tu búsqueda.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <BaseCard 
                v-for="client in filteredClients" 
                :key="client.id" 
                padding="none" 
                class="overflow-hidden group hover:border-primary/50 transition-all cursor-pointer"
                @click="viewHistory(client)"
            >
                <div class="p-6 space-y-4">
                    <div class="flex items-start justify-between">
                        <div class="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Users class="w-7 h-7" />
                        </div>
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <BaseButton variant="ghost" size="icon" @click.stop="openEditModal(client)"><Edit2 class="w-4 h-4" /></BaseButton>
                            <BaseButton variant="ghost" size="icon" class="text-destructive" @click.stop="deleteClient(client.id)"><Trash2 class="w-4 h-4" /></BaseButton>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-xl font-black text-foreground uppercase tracking-tight truncate">{{ client.name }}</h4>
                        <div class="flex items-center gap-2 text-foreground/40 font-mono text-xs mt-1">
                            <Hash class="w-3 h-3" /> {{ client.fiscalId }}
                        </div>
                    </div>

                    <div class="space-y-2 pt-2">
                        <div class="flex items-center gap-3 text-sm font-bold text-foreground/60">
                            <Phone class="w-4 h-4 text-primary" /> {{ client.phone }}
                        </div>
                        <div v-if="client.email" class="flex items-center gap-3 text-sm font-bold text-foreground/60 truncate">
                            <Mail class="w-4 h-4 text-primary" /> {{ client.email }}
                        </div>
                        <div v-if="client.address" class="flex items-center gap-3 text-sm font-bold text-foreground/60 truncate">
                            <MapPin class="w-4 h-4 text-primary" /> {{ client.address }}
                        </div>
                    </div>
                </div>

                <div class="bg-accent/5 p-4 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/30">
                    <span>Ver Historial de Ventas</span>
                    <ArrowRight class="w-3 h-3" />
                </div>
            </BaseCard>
        </div>

        <!-- ADD/EDIT MODAL -->
        <AppDialog :is-open="isModalOpen" @close="isModalOpen = false" :title="selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'">
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Nombre / Razón Social</label>
                        <input v-model="clientForm.name" type="text" class="w-full bg-accent/10 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">NIF / CIF / NIE <span class="text-primary">*</span></label>
                        <input v-model="clientForm.fiscalId" type="text" placeholder="Ej: B12345678" class="w-full bg-accent/10 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Teléfono <span class="text-primary">*</span></label>
                        <input v-model="clientForm.phone" type="text" class="w-full bg-accent/10 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Correo Electrónico</label>
                        <input v-model="clientForm.email" type="email" class="w-full bg-accent/10 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary outline-none" />
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Dirección Completa</label>
                    <input v-model="clientForm.address" type="text" class="w-full bg-accent/10 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary outline-none" />
                </div>

                <div class="flex gap-4">
                    <BaseButton variant="secondary" class="flex-1 py-4" @click="isModalOpen = false">Cancelar</BaseButton>
                    <BaseButton variant="primary" class="flex-1 py-4" :loading="isSubmitting" @click="handleSubmit">
                        {{ selectedClient ? 'Guardar Cambios' : 'Crear Cliente' }}
                    </BaseButton>
                </div>
            </div>
        </AppDialog>

        <!-- HISTORY MODAL -->
        <div v-if="isHistoryModalOpen" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div class="bg-card w-full max-w-3xl rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-8 border-b border-border flex items-center justify-between bg-accent/5">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <ShoppingBag class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="text-2xl font-black tracking-tighter">Historial: {{ selectedClient?.name }}</h3>
                            <p class="text-xs font-bold text-foreground/40">Registro de todas las facturas emitidas a este cliente.</p>
                        </div>
                    </div>
                    <button @click="isHistoryModalOpen = false" class="p-3 hover:bg-accent/50 rounded-2xl transition-colors">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <div class="p-8 max-h-[60vh] overflow-y-auto no-scrollbar space-y-4">
                    <div v-if="!selectedClient?.invoices?.length" class="py-20 text-center text-foreground/20 italic font-bold">
                        Este cliente aún no tiene ventas registradas.
                    </div>
                    <div v-for="inv in selectedClient?.invoices" :key="inv.id" class="flex items-center justify-between p-5 bg-accent/5 rounded-[2rem] border border-border hover:border-primary/30 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center font-black text-xs">
                                #{{ inv.invoiceNumber }}
                            </div>
                            <div>
                                <p class="text-sm font-black">{{ formatDate(inv.createdAt) }}</p>
                                <p class="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{{ inv.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo' }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xl font-black tracking-tighter text-primary">€{{ Number(inv.amount).toFixed(2) }}</p>
                            <p class="text-[10px] font-black uppercase text-foreground/30">{{ inv.items?.length || 0 }} productos</p>
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-accent/5 border-t border-border flex justify-between items-center px-10">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-black uppercase tracking-widest text-foreground/30">Volumen Total</span>
                        <span class="text-2xl font-black text-primary">€{{ selectedClient?.invoices?.reduce((s: number, i: any) => s + Number(i.amount), 0).toFixed(2) }}</span>
                    </div>
                    <BaseButton variant="primary" @click="isHistoryModalOpen = false">Cerrar</BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
