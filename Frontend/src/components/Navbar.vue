<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const menuOpen = ref(false)

onMounted(() => {
  if (auth.isLoggedIn) {
    cart.fetchCart()
  }
})

function goToSearch() {
  router.push('/search')
  menuOpen.value = false
}

function goToCart() {
  router.push('/cart')
  menuOpen.value = false
}

function goToLogin() {
  router.push('/login')
  menuOpen.value = false
}

function goToAccount() {
  router.push('/account')
  menuOpen.value = false
}

function goToSeller() {
  router.push('/seller')
  menuOpen.value = false
}

function goToAdmin() {
  router.push('/admin')
  menuOpen.value = false
}

function handleLogout() {
  auth.logout()
  cart.items = []
  cart.total = 0
  router.push('/')
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
        <router-link to="/search?category=iPhones" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
          iPhones
        </router-link>
        <router-link to="/search?category=iPads" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
          iPads
        </router-link>
        <router-link to="/search?category=AirPods" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
          AirPods
        </router-link>
        <router-link to="/search?category=Accessories" class="px-3 py-2 text-[15px] font-medium text-charcoal hover:text-black transition-colors tracking-ui rounded-lg hover:bg-neutral-50">
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
          <span v-if="cart.itemCount > 0" class="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {{ cart.itemCount }}
          </span>
        </button>

        <!-- Auth Actions -->
        <template v-if="!auth.isLoggedIn">
          <button @click="goToLogin" class="hidden md:flex p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all">
            <span class="material-symbols-outlined text-[20px]">login</span>
          </button>
        </template>
        <template v-else>
          <div class="hidden md:flex items-center gap-1">
            <button v-if="auth.isAdmin" @click="goToAdmin" class="p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all" title="Admin">
              <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </button>
            <button v-if="auth.isSeller" @click="goToSeller" class="p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all" title="Seller Dashboard">
              <span class="material-symbols-outlined text-[20px]">store</span>
            </button>
            <button @click="handleLogout" class="p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all" title="Logout">
              <span class="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </template>

        <button @click="menuOpen = !menuOpen" class="lg:hidden p-2.5 text-charcoal hover:text-black hover:bg-neutral-50 rounded-full transition-all">
          <span class="material-symbols-outlined text-[20px]">{{ menuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="menuOpen" class="lg:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl">
      <nav class="flex flex-col px-5 py-4 gap-1">
        <router-link @click="menuOpen = false" to="/search?category=iPhones" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          iPhones
        </router-link>
        <router-link @click="menuOpen = false" to="/search?category=iPads" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          iPads
        </router-link>
        <router-link @click="menuOpen = false" to="/search?category=AirPods" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          AirPods
        </router-link>
        <router-link @click="menuOpen = false" to="/search?category=Accessories" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
          Accessories
        </router-link>
        <div v-if="!auth.isLoggedIn" class="pt-3 border-t border-neutral-100 mt-2">
          <router-link @click="menuOpen = false" to="/login" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">login</span> Sign In
          </router-link>
          <router-link @click="menuOpen = false" to="/register" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">person_add</span> Create Account
          </router-link>
        </div>
        <div v-else class="pt-3 border-t border-neutral-100 mt-2">
          <router-link v-if="auth.isAdmin" @click="menuOpen = false" to="/admin" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span> Admin
          </router-link>
          <router-link v-if="auth.isSeller" @click="menuOpen = false" to="/seller" class="px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">store</span> Seller Dashboard
          </router-link>
          <button @click="handleLogout" class="w-full text-left px-3 py-3 text-[15px] font-medium text-charcoal hover:text-black hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">logout</span> Sign Out
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>
