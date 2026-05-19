<script setup>
import { ref, onMounted } from 'vue'
import ProductCard from './ProductCard.vue'
import { useProductStore } from '../store/products'

const store = useProductStore()
const fallbackProducts = ref([
  { id: '1', name: 'iPhone 15 Pro Max', color: 'Natural Titanium', price: 1199, category: 'IPHONES', isLimited: true },
  { id: '2', name: 'iPad Pro 12.9"', color: 'Space Gray', price: 1099, category: 'IPADS', isLimited: false },
  { id: '3', name: 'AirPods Pro 2', color: 'White', price: 249, category: 'AIRPODS', isLimited: false },
  { id: '4', name: 'MagSafe Charger', color: 'White', price: 39, category: 'ACCESSORIES', isLimited: false }
])

onMounted(() => {
  store.fetchFeatured()
})

const featuredProducts = computed(() => {
  if (store.featured && store.featured.length > 0) {
    return store.featured.map(p => ({
      id: p.id,
      name: p.name,
      color: p.description || 'Premium',
      price: Number(p.price),
      category: p.category?.name || 'ACCESSORIES',
      isLimited: false
    }))
  }
  return fallbackProducts.value
})

// Need to import computed since we use it
import { computed } from 'vue'
</script>

<template>
  <section class="py-16 md:py-24 bg-neutral-50">
    <div class="max-w-7xl mx-auto px-5 md:px-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-14">
        <div>
          <span class="text-[11px] font-medium uppercase tracking-cta text-warm-gray mb-2 block">Essentials</span>
          <h2 class="text-2xl md:text-3xl lg:text-4xl font-light text-black tracking-tight leading-[1.15]">Featured Products</h2>
        </div>
        <router-link to="/search" class="text-[13px] md:text-sm font-medium text-charcoal hover:text-black transition-colors flex items-center gap-1.5 tracking-wide shrink-0">
          View All <span class="material-symbols-outlined text-base">arrow_forward</span>
        </router-link>
      </div>

      <div v-if="store.loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        <div v-for="n in 4" :key="n" class="bg-white rounded-2xl h-64 animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :id="product.id"
          :name="product.name"
          :color="product.color"
          :price="product.price"
          :category="product.category"
          :is-limited="product.isLimited"
        />
      </div>
    </div>
  </section>
</template>
