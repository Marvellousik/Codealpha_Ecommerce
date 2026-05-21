<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'
import apiClient from '../api/client'
import { getIcon } from '../data/products'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login?redirect=/checkout')
    return
  }
  cart.fetchCart()
})

const shipping = ref({
  fullName: auth.user?.name || '',
  address: '',
  city: '',
  phone: ''
})

const placing = ref(false)
const orderError = ref('')

const shippingCost = 25
const total = computed(() => cart.total + shippingCost)

async function placeOrder() {
  if (cart.items.length === 0) {
    orderError.value = 'Your cart is empty'
    return
  }
  placing.value = true
  orderError.value = ''
  try {
    await apiClient.post('/orders')
    await cart.fetchCart()
    router.push('/orders?success=1')
  } catch (err) {
    orderError.value = err.response?.data?.error || 'Failed to place order'
  } finally {
    placing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#1d1d1f]">
    <main class="max-w-7xl mx-auto px-6 py-12 lg:py-16">
      <header class="mb-12">
        <h1 class="font-h1 text-h1 text-[#1d1d1f] uppercase tracking-tighter">Checkout</h1>
        <p class="font-label-caps text-label-caps text-neutral-500 mt-2">REVIEW AND CONFIRM YOUR ORDER</p>
      </header>

      <div v-if="cart.loading" class="py-20 text-center">
        <div class="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-neutral-500">Loading...</p>
      </div>

      <div v-else-if="cart.items.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <span class="material-symbols-outlined text-6xl text-neutral-200 mb-6">inventory_2</span>
        <h2 class="font-h2 text-h2 uppercase tracking-tight">Cart is Empty</h2>
        <p class="font-body-md text-neutral-500 mt-3 max-w-xs">Add items before checking out.</p>
        <router-link to="/search" class="mt-10 px-8 py-3 border border-neutral-200 text-[#1d1d1f] font-label-caps text-label-caps tracking-widest hover:bg-neutral-50 transition-colors rounded-sm">
          Start Exploring
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <!-- Left: Shipping + Items -->
        <div class="lg:col-span-7 space-y-8">
          <!-- Shipping Info -->
          <div class="bg-neutral-50 p-6 lg:p-8 rounded-lg border border-neutral-100">
            <h3 class="font-label-caps text-label-caps tracking-widest text-neutral-500 mb-6">SHIPPING DETAILS</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Full Name</label>
                <input v-model="shipping.fullName" type="text" required class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Address</label>
                <input v-model="shipping.address" type="text" required class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors" placeholder="123 Apple Street" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">City</label>
                  <input v-model="shipping.city" type="text" required class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors" placeholder="Cupertino" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Phone</label>
                  <input v-model="shipping.phone" type="tel" required class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors" placeholder="+1 234 567 890" />
                </div>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="space-y-4">
            <h3 class="font-label-caps text-label-caps tracking-widest text-neutral-500">ORDER ITEMS</h3>
            <div v-for="item in cart.items" :key="item.id" class="flex gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
              <div class="w-20 h-20 bg-white rounded-md border border-neutral-100 flex items-center justify-center flex-shrink-0">
                <img v-if="item.product.imageUrl" :src="item.product.imageUrl" :alt="item.product.name" class="w-full h-full object-cover rounded-md" />
                <span v-else class="material-symbols-outlined text-3xl text-neutral-300">{{ getIcon(item.product.category?.name || 'ACCESSORIES') }}</span>
              </div>
              <div class="flex-1">
                <h4 class="font-body-md font-semibold text-[#1d1d1f]">{{ item.product.name }}</h4>
                <p class="text-[11px] font-mono text-neutral-400 mt-0.5">QTY: {{ item.quantity }}</p>
              </div>
              <span class="font-body-md text-black">${{ (item.product.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Summary -->
        <div class="lg:col-span-5">
          <div class="sticky top-24 bg-neutral-50 p-6 lg:p-8 rounded-lg space-y-4 border border-neutral-100">
            <h3 class="font-label-caps text-label-caps tracking-widest text-neutral-500">SUMMARY</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="font-body-md text-neutral-500">Subtotal</span>
                <span class="font-body-md text-[#1d1d1f]">${{ cart.total.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-body-md text-neutral-500">Shipping</span>
                <span class="font-body-md text-[#1d1d1f]">${{ shippingCost.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between pt-4 border-t border-neutral-200">
                <span class="font-body-lg font-bold text-[#1d1d1f]">Total</span>
                <span class="font-body-lg font-bold text-black">${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="orderError" class="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {{ orderError }}
            </div>

            <div class="pt-4">
              <button
                @click="placeOrder"
                :disabled="placing"
                class="w-full py-4 bg-black text-white font-label-caps text-label-caps tracking-[0.2em] hover:bg-neutral-800 active:scale-[0.98] transition-all rounded-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="placing" class="inline-block w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                {{ placing ? 'Placing Order...' : 'Place Order' }}
              </button>
              <p class="text-[10px] text-center text-neutral-400 mt-4 font-mono tracking-wider">SECURE ENCRYPTED TRANSACTION</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
