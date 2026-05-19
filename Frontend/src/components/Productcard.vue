<script setup>
import { useRouter } from 'vue-router'
import { getIcon } from '../data/products'

const props = defineProps({
  id: { type: [String, Number], required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: '' },
  isLimited: { type: Boolean, default: false }
})

const router = useRouter()
const icon = getIcon(props.category)

function goToProduct() {
  router.push(`/product/${props.id}`)
}
</script>

<template>
  <div @click="goToProduct" class="group cursor-pointer">
    <div class="aspect-[3/4] bg-neutral-50 mb-5 overflow-hidden relative flex items-center justify-center rounded-2xl shadow-outline group-hover:shadow-card transition-shadow duration-300">
      <div class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-soft">
        <span class="material-symbols-outlined text-3xl md:text-4xl text-neutral-400">{{ icon }}</span>
      </div>
      <div v-if="isLimited" class="absolute top-3 right-3 md:top-4 md:right-4">
        <span class="bg-black text-white text-[10px] font-medium uppercase tracking-cta px-2.5 py-1 rounded-pill">Limited</span>
      </div>
    </div>
    <div class="flex justify-between items-start gap-3">
      <div class="min-w-0">
        <h3 class="text-[15px] md:text-base font-medium text-black leading-snug mb-0.5 truncate">{{ name }}</h3>
        <p class="text-[13px] text-charcoal tracking-wide">{{ color }}</p>
      </div>
      <span class="text-[15px] md:text-base font-medium text-black shrink-0">${{ price }}</span>
    </div>
  </div>
</template>
