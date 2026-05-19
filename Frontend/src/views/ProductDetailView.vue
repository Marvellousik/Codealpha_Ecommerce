<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../store/products'
import { categorySlides, getIcon } from '../data/products'

const route = useRoute()
const router = useRouter()
const store = useProductStore()

const productId = computed(() => route.params.id)

onMounted(() => {
  store.fetchProduct(productId.value)
})

watch(productId, (newId) => {
  store.fetchProduct(newId)
})

const product = computed(() => store.currentProduct)

const currentSlide = ref(0)
const selectedStorage = ref('256GB')
const storageOptions = ['128GB', '256GB', '512GB', '1TB']

const slides = computed(() => {
  if (product.value && categorySlides[product.value.category?.name || '']) {
    return categorySlides[product.value.category.name]
  }
  return [{ icon: 'devices', label: 'Product View' }]
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return store.products
    .filter(p => p.category?.name === product.value?.category?.name && p.id !== product.value?.id)
    .slice(0, 3)
})

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

function goToSlide(index) {
  currentSlide.value = index
}

function goToProduct(id) {
  router.push(`/product/${id}`)
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`
}
</script>

<template>
  <div v-if="store.loading" class="min-h-screen bg-white flex items-center justify-center">
    <div class="w-12 h-12 border-2 border-neutral-200 border-t-black rounded-full animate-spin"></div>
  </div>

  <div v-else-if="product" class="min-h-screen bg-white text-[#1d1d1f] selection:bg-black/10 selection:text-black">
    <main class="max-w-[1440px] mx-auto min-h-screen">
      <div class="flex flex-col lg:flex-row">
        <!-- Left Side: Product Carousel (60%) -->
        <section class="w-full lg:w-[60%] bg-white py-8 lg:py-12 px-6 lg:px-12">
          <div class="relative">
            <!-- Main Carousel -->
            <div class="relative aspect-[3/4] w-full overflow-hidden bg-neutral-50 border border-neutral-100 rounded-xl">
              <div
                class="flex transition-transform duration-700 ease-in-out h-full"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
              >
                <div
                  v-for="(slide, index) in slides"
                  :key="index"
                  class="w-full h-full flex-shrink-0 flex flex-col items-center justify-center bg-neutral-50"
                >
                  <span class="material-symbols-outlined text-[120px] lg:text-[180px] text-neutral-300">{{ slide.icon }}</span>
                  <p class="font-label-caps text-label-caps text-neutral-400 uppercase mt-6 tracking-widest">{{ slide.label }}</p>
                </div>
              </div>

              <!-- Prev / Next Arrows -->
              <button
                @click="prevSlide"
                class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 flex items-center justify-center text-[#1d1d1f] hover:bg-neutral-50 hover:border-black transition-all duration-300 z-10"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                @click="nextSlide"
                class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 flex items-center justify-center text-[#1d1d1f] hover:bg-neutral-50 hover:border-black transition-all duration-300 z-10"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <!-- Dot Indicators -->
            <div class="flex items-center justify-center gap-3 mt-6">
              <button
                v-for="(slide, index) in slides"
                :key="index"
                @click="goToSlide(index)"
                :class="[
                  'w-3 h-3 rounded-full transition-all duration-300',
                  currentSlide === index ? 'bg-black scale-110' : 'bg-neutral-300 hover:bg-neutral-400'
                ]"
                :aria-label="`Go to ${slide.label}`"
              />
            </div>
          </div>
        </section>

        <!-- Right Side: Sticky Content (40%) -->
        <aside class="w-full lg:w-[40%] px-8 lg:px-12 py-12 lg:pt-6 lg:sticky lg:top-[84px] lg:mt-6 bg-neutral-50 lg:rounded-xl lg:border lg:border-neutral-200/50">
          <div class="max-w-md mx-auto lg:mx-0">
            <!-- Brand & ID -->
            <div class="flex items-center justify-between mb-4">
              <span class="font-label-caps text-label-caps text-neutral-600 bg-neutral-100 px-2 py-1 rounded">ARCHIVE ID: AV-{{ product.id.toString().padStart(3, '0') }}-X</span>
              <span class="material-symbols-outlined text-neutral-400" data-icon="verified" style="font-variation-settings: 'FILL' 1;">verified</span>
            </div>

            <!-- Title -->
            <h1 class="font-h1 text-h1 text-[#1d1d1f] mb-4 leading-none uppercase tracking-tighter">
              {{ product.name.replace(' ', '\n').toUpperCase() }}
            </h1>

            <!-- Price -->
            <div class="text-[24px] font-semibold text-black mb-8 tracking-tight">
              {{ formatPrice(product.price) }}
            </div>

            <!-- Description -->
            <div class="font-body-md text-neutral-500 mb-10 space-y-4 max-w-sm">
              <p>{{ product.description || 'Premium Apple product with cutting-edge technology.' }}</p>
              <ul class="text-xs font-mono tracking-wider space-y-1 text-neutral-400">
                <li>• CATEGORY: {{ product.category?.name || 'ACCESSORIES' }}</li>
                <li>• STOCK: {{ product.stock }} UNITS</li>
                <li>• SELLER: {{ product.seller?.name || 'AppleVault Store' }}</li>
              </ul>
            </div>

            <!-- CTA Section -->
            <div class="space-y-4 mb-12">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Select Storage</span>
              </div>
              <div class="grid grid-cols-4 gap-2 mb-6">
                <button
                  v-for="option in storageOptions"
                  :key="option"
                  @click="selectedStorage = option"
                  :class="[
                    'h-12 border text-xs font-mono transition-colors rounded-sm',
                    selectedStorage === option
                      ? 'border-black bg-neutral-100 text-[#1d1d1f]'
                      : 'border-neutral-200 hover:border-black text-neutral-400'
                  ]"
                >
                  {{ option }}
                </button>
              </div>
              <button class="w-full py-5 bg-black text-white font-semibold tracking-tight hover:bg-neutral-800 active:scale-[0.98] transition-all rounded-lg flex items-center justify-center space-x-2">
                <span>ADD TO CART</span>
                <span class="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
              </button>
              <button class="w-full py-5 border border-neutral-200 text-[#1d1d1f] font-semibold tracking-tight hover:bg-neutral-100 active:scale-[0.98] transition-all rounded-lg">
                SAVE FOR LATER
              </button>
            </div>

            <!-- Seller Info -->
            <div class="pt-8 border-t border-neutral-200 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center">
                  <span class="material-symbols-outlined text-neutral-400">store</span>
                </div>
                <div>
                  <p class="text-xs font-bold text-[#1d1d1f]">{{ product.seller?.name || 'AppleVault Store' }}</p>
                  <p class="text-[10px] font-mono text-neutral-400">Verified Seller</p>
                </div>
              </div>
              <button class="text-[10px] font-mono text-neutral-400 hover:text-black underline uppercase">View Profile</button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Related Items: Complete the Look -->
      <section v-if="relatedProducts.length" class="px-8 lg:px-margin py-16 bg-white">
        <div class="flex items-end justify-between mb-12">
          <div>
            <span class="font-label-caps text-label-caps text-black mb-2 block">RECOMMENDED PAIRINGS</span>
            <h2 class="font-h2 text-h2 text-[#1d1d1f] uppercase tracking-tight">COMPLETE THE SETUP</h2>
          </div>
          <div class="flex space-x-4">
            <button class="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-[#1d1d1f] hover:border-neutral-400 transition-all">
              <span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
            </button>
            <button class="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-[#1d1d1f] hover:border-neutral-400 transition-all">
              <span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="related in relatedProducts"
            :key="related.id"
            class="group cursor-pointer"
            @click="goToProduct(related.id)"
          >
            <div class="aspect-[4/5] bg-neutral-50 overflow-hidden mb-4 relative flex items-center justify-center rounded-lg border border-neutral-100">
              <div class="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-5xl text-neutral-300">{{ getIcon(related.category?.name || 'ACCESSORIES') }}</span>
              </div>
            </div>
            <div class="flex justify-between items-start">
              <div>
                <p class="font-label-caps text-label-caps text-neutral-500 mb-1">{{ related.category?.name }}</p>
                <h3 class="font-semibold text-[#1d1d1f] group-hover:text-black transition-colors">{{ related.name }}</h3>
              </div>
              <span class="text-xs font-mono text-neutral-400">${{ Number(related.price).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <!-- Not Found State -->
  <div v-else class="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
    <span class="material-symbols-outlined text-neutral-200 text-8xl mb-6">inventory_2</span>
    <h1 class="font-h1 text-h1 text-neutral-400 mb-4 uppercase">Product Not Found</h1>
    <p class="text-neutral-400 max-w-md mx-auto mb-8">The product you are looking for does not exist in our archive.</p>
    <router-link to="/search" class="px-8 py-3 bg-black text-white font-label-caps uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-sm">
      Browse Catalog
    </router-link>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
