<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, ReceiptText, Banknote, CreditCard, Printer, Loader2, Delete } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  cart: any[]
  cartTotal: number
  currency: string
  isProcessing: boolean
}>()

const emit = defineEmits(['close', 'checkout'])

const paymentMethod = ref<'cash' | 'card'>('cash')
const amountReceived = ref(0)
const shouldPrintTicket = ref(true)

const changeDue = computed(() => {
  if (paymentMethod.value !== 'cash') return 0
  return Math.max(0, amountReceived.value - props.cartTotal)
})

const appendDigit = (digit: string) => {
  const current = amountReceived.value.toString()
  if (digit === '.' && current.includes('.')) return
  if (current === '0' && digit !== '.') {
    amountReceived.value = parseFloat(digit)
  } else {
    amountReceived.value = parseFloat(current + digit)
  }
}

const backspace = () => {
  const current = amountReceived.value.toString()
  if (current.length <= 1) {
    amountReceived.value = 0
  } else {
    amountReceived.value = parseFloat(current.slice(0, -1))
  }
}

const quickCash = (amount: number) => {
  amountReceived.value = amount
}

const handleCheckout = () => {
  emit('checkout', {
    paymentMethod: paymentMethod.value,
    shouldPrintTicket: shouldPrintTicket.value
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 lg:p-4 animate-in fade-in duration-300">
    <div class="bg-card w-full max-w-[95vw] lg:max-w-7xl rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col lg:flex-row h-[90vh] lg:h-auto max-h-[95vh]">
      
      <!-- Col 1: Summary -->
      <div class="lg:w-1/4 p-6 lg:p-8 bg-accent/5 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto no-scrollbar">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <ReceiptText class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-black">Resumen</h3>
        </div>
        
        <div class="space-y-3 mb-6">
          <div v-for="item in cart" :key="item.id" class="flex justify-between items-start text-xs font-bold gap-2">
            <span class="text-foreground/60 leading-tight">{{ item.quantity }}x {{ item.name }}</span>
            <span class="whitespace-nowrap">{{ currency }}{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="pt-4 border-t border-border space-y-3 mt-auto">
          <div class="flex justify-between items-center text-foreground/40 text-xs">
            <span>Subtotal</span>
            <span>{{ currency }}{{ (cartTotal * 0.9).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center text-foreground/40 text-xs">
            <span>IVA (10%)</span>
            <span>{{ currency }}{{ (cartTotal * 0.1).toFixed(2) }}</span>
          </div>
          <div class="flex flex-col pt-2">
            <span class="text-[10px] font-black uppercase text-primary/40 tracking-widest">Total a Pagar</span>
            <span class="text-4xl font-black text-primary">{{ currency }}{{ cartTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Col 2: Payment Methods & Options -->
      <div class="flex-1 p-6 lg:p-8 space-y-6 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-border">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-black">Cobro</h3>
          <button @click="emit('close')" class="lg:hidden p-2 hover:bg-accent/50 rounded-xl transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 p-1 bg-accent/20 rounded-2xl">
          <button @click="paymentMethod = 'cash'" class="flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black" :class="paymentMethod === 'cash' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'">
            <Banknote class="w-6 h-6" /> Efectivo
          </button>
          <button @click="paymentMethod = 'card'" class="flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black" :class="paymentMethod === 'card' ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'">
            <CreditCard class="w-6 h-6" /> Tarjeta
          </button>
        </div>

        <div class="space-y-3">
          <span class="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Opciones de Ticket</span>
          <div class="grid grid-cols-2 gap-3 p-1 bg-accent/20 rounded-2xl">
            <button @click="shouldPrintTicket = true" class="flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs" :class="shouldPrintTicket ? 'bg-card text-primary shadow-sm' : 'text-foreground/40'">
              <Printer class="w-4 h-4" /> Imprimir
            </button>
            <button @click="shouldPrintTicket = false" class="flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs" :class="!shouldPrintTicket ? 'bg-card text-foreground/60 shadow-sm' : 'text-foreground/40'">
              <X class="w-4 h-4" /> No imprimir
            </button>
          </div>
        </div>

        <div v-if="paymentMethod === 'cash'" class="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col items-center justify-center flex-1 animate-in zoom-in-95 duration-300">
          <span class="text-sm font-bold text-primary/60 mb-1">Cambio a devolver</span>
          <span class="text-5xl font-black text-primary">{{ currency }}{{ changeDue.toFixed(2) }}</span>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40 italic">
          <CreditCard class="w-16 h-16" />
          <p class="font-bold">Procesa el pago en el datáfono para continuar</p>
        </div>

        <button 
          @click="handleCheckout"
          :disabled="isProcessing"
          class="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 mt-auto"
        >
          <Loader2 v-if="isProcessing" class="w-8 h-8 animate-spin" />
          <span v-else>Confirmar y Pagar</span>
        </button>
      </div>

      <!-- Col 3: Keypad (Only for Cash) -->
      <div v-if="paymentMethod === 'cash'" class="lg:w-1/3 p-6 lg:p-8 bg-accent/10 flex flex-col animate-in slide-in-from-right-4 duration-500">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black">Teclado Numérico</h3>
          <button @click="emit('close')" class="p-2 hover:bg-accent/50 rounded-xl transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="bg-card p-6 rounded-3xl border-2 border-primary shadow-sm flex flex-col items-center mb-6">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-1">Efectivo Recibido</span>
          <div class="text-4xl font-black text-primary flex items-center gap-1">
            <span class="text-xl opacity-40">{{ currency }}</span>
            {{ amountReceived.toFixed(2) }}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 flex-1 mb-6">
          <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" @click="appendDigit(n.toString())" class="aspect-square bg-card rounded-2xl font-black text-2xl shadow-sm hover:bg-primary hover:text-white active:scale-90 transition-all">{{ n }}</button>
          <button @click="appendDigit('.')" class="aspect-square bg-card rounded-2xl font-black text-2xl shadow-sm hover:bg-accent/50 transition-all">.</button>
          <button @click="appendDigit('0')" class="aspect-square bg-card rounded-2xl font-black text-2xl shadow-sm hover:bg-primary hover:text-white transition-all">0</button>
          <button @click="backspace" class="aspect-square bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center hover:bg-destructive hover:text-white active:scale-90 transition-all">
            <Delete class="w-8 h-8" />
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <button @click="quickCash(cartTotal)" class="py-3 bg-primary/20 text-primary rounded-xl font-black text-[10px] hover:bg-primary hover:text-white transition-all">EXACTO</button>
          <button @click="quickCash(10)" class="py-3 bg-accent/20 rounded-xl font-black text-xs hover:bg-accent/40 transition-all">{{ currency }}10</button>
          <button @click="quickCash(20)" class="py-3 bg-accent/20 rounded-xl font-black text-xs hover:bg-accent/40 transition-all">{{ currency }}20</button>
          <button @click="quickCash(50)" class="py-3 bg-accent/20 rounded-xl font-black text-xs hover:bg-accent/40 transition-all">{{ currency }}50</button>
        </div>
      </div>

      <button v-if="paymentMethod !== 'cash'" @click="emit('close')" class="absolute top-6 right-6 p-3 hover:bg-accent/50 rounded-2xl transition-colors">
        <X class="w-8 h-8" />
      </button>
    </div>
  </div>
</template>
