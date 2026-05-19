<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../store/products'
import { getIcon } from '../data/products'

const router = useRouter()
const store = useProductStore()

onMounted(() => {
  store.fetchFeatured()
})

const drops = computed(() => {
  if (store.newDrops && store.newDrops.length > 0) {
    return store.newDrops.map((p, i) => ({
      id: p.id,
      collectionId: `NEW DROP ${String(i + 1).padStart(3, '0')}`,
      name: p.name,
      category: p.category?.name || 'ACCESSORIES'
    }))
  }
  return [
    { id: '1', collectionId: 'NEW DROP 001', name: 'iPhone 15 / Blue', category: 'IPHONES' },
    { id: '2', collectionId: 'NEW DROP 002', name: 'iPad Air / Starlight', category: 'IPADS' },
    { id: '3', collectionId: 'NEW DROP 003', name: 'AirPods Max / Silver', category: 'AIRPODS' },
    { id: '4', collectionId: 'NEW DROP 004', name: 'Apple Watch Ultra 2', category: 'ACCESSORIES' }
  ]
})

function goToProduct(id) {
  router.push(`/product/${id}`)
}
</script>

<template>
  <section class="py-16 md:py-24 bg-neutral-50">
    <div class="max-w-7xl mx-auto px-5 md:px-6 mb-10 md:mb-14">
      <div class="flex items-center gap-3 mb-2">
        <div class="h-px w-8 bg-black"></div>
        <span class="text-[11px] font-medium uppercase tracking-cta text-warm-gray">Fresh Arrivals</span>
      </div>
      <h2 class="text-2xl md:text-3xl lg:text-4xl font-light text-black tracking-tight leading-[1.15]">New Drops</h2>
    </div>

    <div v-if="store.loading" class="flex overflow-x-auto gap-4 md:gap-6 px-5 md:px-6 pb-6">
      <div v-for="n in 4" :key="n" class="flex-none w-[280px] md:w-[320px] h-[320px] bg-white rounded-2xl animate-pulse"></div>
    </div>

    <div v-else class="flex overflow-x-auto gap-4 md:gap-6 px-5 md:px-6 pb-6 snap-x snap-mandatory hide-scrollbar">
      <div
        v-for="drop in drops"
        :key="drop.id"
        class="flex-none w-[280px] md:w-[320px] snap-start cursor-pointer"
        @click="goToProduct(drop.id)"
      >
        <div class="aspect-square bg-white mb-4 relative group overflow-hidden flex items-center justify-center rounded-2xl shadow-outline hover:shadow-card transition-shadow duration-300">
          <div class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-neutral-50 flex items-center justify-center shadow-soft">
            <span class="material-symbols-outlined text-4xl md:text-5xl text-neutral-300">{{ getIcon(drop.category) }}</span>
          </div>

          <div class="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-white/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-md">
            <button class="w-full py-2.5 bg-black text-white text-[11px] font-medium uppercase tracking-cta rounded-pill">
              Quick Add
            </button>
          </div>
        </div>

        <div class="px-1">
          <p class="text-[11px] font-medium uppercase tracking-cta text-warm-gray mb-1">{{ drop.collectionId }}</p>
          <h4 class="text-[15px] font-medium text-black">{{ drop.name }}</h4>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
