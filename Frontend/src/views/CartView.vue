<script setup>
import { ref, computed } from 'vue'
import { getIcon } from '../data/products'

const cartItems = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    category: 'IPHONES',
    variant: 'Natural Titanium / 256GB',
    price: 1199,
    qty: 1
  },
  {
    id: 5,
    name: 'AirPods Pro 2',
    category: 'AIRPODS',
    variant: 'White / USB-C',
    price: 249,
    qty: 1
  }
])

const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.qty, 0))
const shipping = ref(25)
const total = computed(() => subtotal.value + shipping.value)

function incQty(item) {
  item.qty++
}
function decQty(item) {
  if (item.qty > 1) item.qty--
}
function removeItem(id) {
  cartItems.value = cartItems.value.filter(i => i.id !== id)
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#1d1d1f] font-body-md selection:bg-black/10 selection:text-black">
    <main class="max-w-7xl mx-auto px-6 py-12 lg:py-16 min-h-screen">
      <!-- Header -->
      <header class="mb-12">
        <h1 class="font-h1 text-h1 text-[#1d1d1f] uppercase tracking-tighter">Cart</h1>
        <p class="font-label-caps text-label-caps text-neutral-500 mt-2">{{ cartItems.length }} ITEMS SELECTED</p>
      </header>

      <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <!-- Items List -->
        <div class="lg:col-span-8 space-y-6">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="flex flex-col md:flex-row gap-6 bg-neutral-50 p-6 rounded-lg group hover:bg-neutral-100 transition-colors duration-150 border border-neutral-100"
          >
            <!-- Icon Placeholder -->
            <div class="w-full md:w-48 aspect-square overflow-hidden bg-white flex items-center justify-center flex-shrink-0 rounded-md border border-neutral-100">
              <span class="material-symbols-outlined text-7xl text-neutral-300">{{ getIcon(item.category) }}</span>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <div class="flex justify-between items-start">
                <div>
                  <h2 class="font-body-lg text-body-lg font-semibold text-[#1d1d1f]">{{ item.name }}</h2>
                  <p class="font-label-caps text-label-caps text-neutral-500 mt-1 uppercase">{{ item.variant }}</p>
                </div>
                <span class="font-body-md text-body-md text-black">${{ (item.price * item.qty).toFixed(2) }}</span>
              </div>

              <div class="flex justify-between items-center mt-6">
                <div class="flex items-center border border-neutral-200 rounded-sm bg-white">
                  <button @click="decQty(item)" class="p-2 hover:text-black transition-colors">
                    <span class="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span class="px-4 font-label-caps text-label-caps">{{ item.qty }}</span>
                  <button @click="incQty(item)" class="p-2 hover:text-black transition-colors">
                    <span class="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <button @click="removeItem(item.id)" class="text-neutral-400 hover:text-red-600 transition-colors">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Summary Sidebar -->
        <div class="lg:col-span-4">
          <div class="sticky top-24 bg-neutral-50 p-6 lg:p-8 rounded-lg space-y-4 border border-neutral-100">
            <h3 class="font-label-caps text-label-caps tracking-widest text-neutral-500">SUMMARY</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="font-body-md text-neutral-500">Subtotal</span>
                <span class="font-body-md text-[#1d1d1f]">${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-body-md text-neutral-500">Shipping (Express)</span>
                <span class="font-body-md text-[#1d1d1f]">${{ shipping.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between pt-4 border-t border-neutral-200">
                <span class="font-body-lg font-bold text-[#1d1d1f]">Total</span>
                <span class="font-body-lg font-bold text-black">${{ total.toFixed(2) }}</span>
              </div>
            </div>
            <div class="pt-4">
              <button class="w-full py-4 bg-black text-white font-label-caps text-label-caps tracking-[0.2em] hover:bg-neutral-800 active:scale-[0.98] transition-all rounded-sm uppercase">
                Initialize Checkout
              </button>
              <p class="text-[10px] text-center text-neutral-400 mt-4 font-mono tracking-wider">SECURE ENCRYPTED TRANSACTION</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <span class="material-symbols-outlined text-6xl text-neutral-200 mb-6">inventory_2</span>
        <h2 class="font-h2 text-h2 uppercase tracking-tight">Cart is Empty</h2>
        <p class="font-body-md text-neutral-500 mt-3 max-w-xs">No items have been added to your cart.</p>
        <router-link to="/search" class="mt-10 px-8 py-3 border border-neutral-200 text-[#1d1d1f] font-label-caps text-label-caps tracking-widest hover:bg-neutral-50 transition-colors rounded-sm">
          Start Exploring
        </router-link>
      </div>
    </main>
  </div>
</template>
