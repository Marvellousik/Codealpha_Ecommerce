<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import apiClient from '../api/client'
import { getIcon } from '../data/products'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const orders = ref([])
const loading = ref(false)
const error = ref('')

const showSuccess = computed(() => route.query.success === '1')

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login?redirect=/orders')
    return
  }
  fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiClient.get('/orders')
    orders.value = res.data.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

const statusColors = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-100',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-100',
  DELIVERED: 'bg-green-50 text-green-700 border-green-100',
  CANCELLED: 'bg-red-50 text-red-700 border-red-100',
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#1d1d1f]">
    <main class="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <header class="mb-10">
        <h1 class="font-h1 text-h1 text-[#1d1d1f] uppercase tracking-tighter">Orders</h1>
        <p class="font-label-caps text-label-caps text-neutral-500 mt-2">TRACK YOUR PURCHASES</p>
      </header>

      <div v-if="showSuccess" class="mb-6 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm font-medium text-green-700">
        Order placed successfully! Thank you for your purchase.
      </div>

      <div v-if="loading" class="py-20 text-center">
        <div class="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-neutral-500">Loading orders...</p>
      </div>

      <div v-else-if="error" class="py-20 text-center">
        <p class="text-red-500">{{ error }}</p>
        <button @click="fetchOrders" class="mt-4 px-6 py-2 bg-black text-white text-[13px] font-medium rounded-pill hover:bg-neutral-800 transition-colors">
          Retry
        </button>
      </div>

      <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <span class="material-symbols-outlined text-6xl text-neutral-200 mb-6">receipt_long</span>
        <h2 class="font-h2 text-h2 uppercase tracking-tight">No Orders Yet</h2>
        <p class="font-body-md text-neutral-500 mt-3 max-w-xs">You haven't placed any orders yet.</p>
        <router-link to="/search" class="mt-10 px-8 py-3 border border-neutral-200 text-[#1d1d1f] font-label-caps text-label-caps tracking-widest hover:bg-neutral-50 transition-colors rounded-sm">
          Start Shopping
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <div v-for="order in orders" :key="order.id" class="bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="font-mono text-[11px] text-neutral-400 uppercase">ORDER #{{ order.id.slice(0, 8) }}</span>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-medium border" :class="statusColors[order.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'">
                {{ order.status }}
              </span>
            </div>
            <span class="text-[11px] font-mono text-neutral-400">{{ formatDate(order.createdAt) }}</span>
          </div>

          <div class="px-6 py-4 space-y-3">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
              <div class="w-14 h-14 bg-white rounded-lg border border-neutral-100 flex items-center justify-center flex-shrink-0">
                <img v-if="item.product.imageUrl" :src="item.product.imageUrl" :alt="item.product.name" class="w-full h-full object-cover rounded-lg" />
                <span v-else class="material-symbols-outlined text-2xl text-neutral-300">devices</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-black truncate">{{ item.product.name }}</p>
                <p class="text-[11px] font-mono text-neutral-400">QTY: {{ item.quantity }} × ${{ Number(item.price).toFixed(2) }}</p>
              </div>
              <span class="text-[13px] font-medium text-black">${{ (item.quantity * Number(item.price)).toFixed(2) }}</span>
            </div>
          </div>

          <div class="px-6 py-4 bg-white border-t border-neutral-100 flex items-center justify-between">
            <span class="text-[11px] font-mono text-neutral-400 uppercase">Seller: {{ order.seller?.name || 'AppleVault' }}</span>
            <span class="font-body-md font-bold text-black">Total: ${{ Number(order.totalAmount).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
