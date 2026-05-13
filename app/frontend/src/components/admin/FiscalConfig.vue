<script setup lang="ts">
import { Building2, Coins, Percent, Hash, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  config: any
}>()
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-500">
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
</template>
