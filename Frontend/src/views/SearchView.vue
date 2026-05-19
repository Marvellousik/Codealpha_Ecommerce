<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../store/products'
import { getIcon } from '../data/products'

const router = useRouter()
const store = useProductStore()
const searchQuery = ref('')
const selectedCategory = ref('ALL')

const categories = ['ALL', 'IPHONES', 'IPADS', 'AIRPODS', 'ACCESSORIES']

onMounted(() => {
  store.fetchProducts()
})

// Refetch when search or category changes (debounced could be added)
watch([searchQuery, selectedCategory], () => {
  const params = {}
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  // Note: backend category filter uses categoryId, not name. 
  // We'll do client-side filtering for categories since API uses IDs.
  store.fetchProducts(params)
})

const filteredResults = computed(() => {
  let results = store.allProducts
  if (selectedCategory.value !== 'ALL') {
    results = results.filter(p => p.category?.name?.toUpperCase() === selectedCategory.value)
  }
  return results
})

function goToProduct(id) {
  router.push(`/product/${id}`)
}
</script>

<template>
  <div class="min-h-screen bg-white text-black font-body selection:bg-black/10">
    <main class="max-w-7xl mx-auto px-5 md:px-6 py-12 md:py-16">
      <!-- Header -->
      <div class="mb-10 md:mb-14">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[11px] font-medium uppercase tracking-cta text-warm-gray">Collections</span>
          <span class="text-neutral-300">/</span>
          <span class="text-[11px] font-medium uppercase tracking-cta text-black">All Items</span>
        </div>
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-light text-black tracking-tight leading-[1.1] mb-3">Apple Devices</h1>
        <p class="text-base md:text-lg text-charcoal tracking-body max-w-2xl">A curated selection of iPhones, iPads, AirPods, and premium Apple accessories.</p>
      </div>

      <!-- Search Bar -->
      <div class="mb-8 md:mb-10">
        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-0 text-neutral-300 text-2xl md:text-3xl">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search iPhones, iPads, AirPods..."
            class="w-full bg-transparent border-b border-neutral-200 text-xl md:text-3xl text-black py-3.5 pl-10 md:pl-12 pr-4 focus:outline-none focus:border-black transition-colors placeholder:text-neutral-300 font-light tracking-tight rounded-none"
          />
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-wrap justify-between items-center gap-4 mb-8 md:mb-10 py-4 border-y border-neutral-100">
        <div class="flex gap-3 items-center">
          <button class="flex items-center gap-2 px-4 py-2.5 bg-white shadow-outline hover:shadow-card transition-shadow rounded-xl text-[13px] font-medium text-charcoal">
            <span class="material-symbols-outlined text-base">filter_list</span>
            Filter
          </button>
          <div class="hidden md:flex gap-2 items-center border-l border-neutral-100 pl-3">
            <button class="px-3 py-2 text-[13px] font-medium text-charcoal hover:text-black transition-colors rounded-lg hover:bg-neutral-50">Collection</button>
            <button class="px-3 py-2 text-[13px] font-medium text-charcoal hover:text-black transition-colors rounded-lg hover:bg-neutral-50">Size</button>
            <button class="px-3 py-2 text-[13px] font-medium text-charcoal hover:text-black transition-colors rounded-lg hover:bg-neutral-50">Price</button>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-[11px] font-medium uppercase tracking-cta text-warm-gray">{{ filteredResults.length }} Items</span>
          <button class="flex items-center gap-1.5 text-[13px] font-medium text-black">
            Sort by: Featured
            <span class="material-symbols-outlined text-base">expand_more</span>
          </button>
        </div>
      </div>

      <!-- Category Chips -->
      <div class="flex flex-wrap gap-2 mb-8 md:mb-10">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'px-4 py-2 text-[11px] font-medium uppercase tracking-cta rounded-pill transition-all duration-200',
            selectedCategory === cat
              ? 'bg-black text-white'
              : 'bg-white text-charcoal shadow-outline hover:shadow-card hover:text-black'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div v-for="n in 6" :key="n" class="aspect-[3/4] bg-neutral-50 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Product Grid -->
      <div v-else-if="filteredResults.length > 0" class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div
          v-for="product in filteredResults"
          :key="product.id"
          class="group cursor-pointer"
          @click="goToProduct(product.id)"
        >
          <div class="relative aspect-[3/4] mb-4 bg-neutral-50 flex items-center justify-center rounded-2xl shadow-outline group-hover:shadow-card transition-shadow duration-300 overflow-hidden">
            <div class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center shadow-soft">
              <span class="material-symbols-outlined text-4xl md:text-5xl text-neutral-300">{{ getIcon(product.category?.name || 'ACCESSORIES') }}</span>
            </div>
            <div class="absolute inset-0 border border-neutral-100 group-hover:border-black/10 transition-colors duration-300 rounded-2xl"></div>
          </div>
          <div class="px-0.5">
            <h3 class="text-[14px] md:text-[15px] font-medium text-black group-hover:text-charcoal transition-colors leading-snug mb-0.5">{{ product.name }}</h3>
            <p class="text-[11px] md:text-[12px] text-charcoal tracking-wide uppercase mb-1">{{ product.category?.name || 'Accessory' }}</p>
            <p class="text-[14px] md:text-[15px] font-medium text-black">${{ Number(product.price).toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-20 md:py-28 flex flex-col items-center justify-center text-center border border-neutral-100 border-dashed rounded-2xl">
        <span class="material-symbols-outlined text-neutral-200 text-5xl md:text-6xl mb-5">inventory_2</span>
        <h3 class="text-xl md:text-2xl font-light text-charcoal mb-2 tracking-tight">No products found</h3>
        <p class="text-[13px] md:text-sm text-warm-gray max-w-md mx-auto mb-8">
          The requested product "{{ searchQuery }}" does not exist in our catalog. Try adjusting your search.
        </p>
        <button
          @click="searchQuery = ''; selectedCategory = 'ALL'"
          class="px-6 py-3 bg-black text-white text-[13px] font-medium rounded-pill hover:bg-neutral-800 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </main>
  </div>
</template>
