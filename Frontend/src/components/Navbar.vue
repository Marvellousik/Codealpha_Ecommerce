<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const menuOpen = ref(false)

function goToSearch() {
  router.push('/search')
  menuOpen.value = false
}

function goToCart() {
  router.push('/cart')
  menuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-6 py-3.5">
      <!-- Logo -->
      <router-link to="/" class="text-lg md:text-xl font-bold tracking-tighter text-black shrink-0">
        AppleVault
      </router-link>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-1">
        <router-link to="/" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
          iPhones
        </router-link>
        <router-link to="/" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
          iPads
        </router-link>
        <router-link to="/" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
          AirPods
        </router-link>
        <router-link to="/" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
          Accessories
        </router-link>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <button @click="goToSearch" class="p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all">
          <span class="material-symbols-outlined text-[20px]">search</span>
        </button>
        <button @click="goToCart" class="p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all relative">
          <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
          <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></span>
        </button>
        <button @click="menuOpen = !menuOpen" class="lg:hidden p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all">
          <span class="material-symbols-outlined text-[20px]">{{ menuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="menuOpen" class="lg:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl">
      <nav class="flex flex-col px-5 py-4 gap-1">
        <router-link @click="menuOpen = false" to="/" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          iPhones
        </router-link>
        <router-link @click="menuOpen = false" to="/" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          iPads
        </router-link>
        <router-link @click="menuOpen = false" to="/" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          AirPods
        </router-link>
        <router-link @click="menuOpen = false" to="/" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          Accessories
        </router-link>
      </nav>
    </div>
  </header>
</template>
