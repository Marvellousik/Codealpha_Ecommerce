<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api/client'

const router = useRouter()
const products = ref([])
const featuredIds = ref([])
const newDropIds = ref([])
const loading = ref(false)
const saving = ref(false)
const message = ref('')

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return router.push('/')
  try {
    const user = JSON.parse(userStr)
    if (user.role !== 'ADMIN') return router.push('/')
  } catch {
    return router.push('/')
  }

  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [productsRes, configRes] = await Promise.all([
      apiClient.get('/products?limit=100'),
      apiClient.get('/config'),
    ])

    products.value = productsRes.data.data

    const featuredConfig = configRes.data.data.find(c => c.key === 'FEATURED_PRODUCT_IDS')
    const newDropsConfig = configRes.data.data.find(c => c.key === 'NEW_DROP_IDS')

    featuredIds.value = Array.isArray(featuredConfig?.value) ? featuredConfig.value : []
    newDropIds.value = Array.isArray(newDropsConfig?.value) ? newDropsConfig.value : []
  } catch (err) {
    message.value = 'Failed to load data'
  } finally {
    loading.value = false
  }
}

function toggleFeatured(id) {
  if (featuredIds.value.includes(id)) {
    featuredIds.value = featuredIds.value.filter(fid => fid !== id)
  } else {
    if (featuredIds.value.length >= 8) {
      message.value = 'Maximum 8 featured products allowed'
      return
    }
    featuredIds.value.push(id)
  }
  message.value = ''
}

function toggleNewDrop(id) {
  if (newDropIds.value.includes(id)) {
    newDropIds.value = newDropIds.value.filter(nid => nid !== id)
  } else {
    if (newDropIds.value.length >= 8) {
      message.value = 'Maximum 8 new drops allowed'
      return
    }
    newDropIds.value.push(id)
  }
  message.value = ''
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    const configRes = await apiClient.get('/config')
    const featuredConfig = configRes.data.data.find(c => c.key === 'FEATURED_PRODUCT_IDS')
    const newDropsConfig = configRes.data.data.find(c => c.key === 'NEW_DROP_IDS')

    if (featuredConfig) {
      await apiClient.patch(`/config/${featuredConfig.id}`, { value: featuredIds.value })
    } else {
      await apiClient.post('/config', {
        key: 'FEATURED_PRODUCT_IDS',
        value: featuredIds.value,
        description: 'Featured products on homepage'
      })
    }

    if (newDropsConfig) {
      await apiClient.patch(`/config/${newDropsConfig.id}`, { value: newDropIds.value })
    } else {
      await apiClient.post('/config', {
        key: 'NEW_DROP_IDS',
        value: newDropIds.value,
        description: 'New drops on homepage'
      })
    }

    message.value = 'Homepage content updated successfully!'
  } catch (err) {
    message.value = err.response?.data?.error || 'Failed to save changes'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 py-12">
    <div class="max-w-5xl mx-auto px-5 md:px-6">
      <div class="mb-10">
        <h1 class="text-3xl md:text-4xl font-light text-black tracking-tight mb-2">Admin Dashboard</h1>
        <p class="text-charcoal">Manage featured content and new drops displayed on the homepage.</p>
      </div>

      <div v-if="message" class="mb-6 px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-black">
        {{ message }}
      </div>

      <div v-if="loading" class="py-20 text-center text-charcoal">
        <div class="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        Loading products...
      </div>

      <div v-else>
        <!-- Featured Products -->
        <div class="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-medium text-black mb-1">Featured Products</h2>
              <p class="text-sm text-warm-gray">{{ featuredIds.length }} selected (max 8)</p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-for="product in products"
              :key="`featured-${product.id}`"
              @click="toggleFeatured(product.id)"
              :class="[
                'relative p-4 rounded-xl border text-left transition-all',
                featuredIds.includes(product.id)
                  ? 'border-black bg-neutral-50 shadow-outline'
                  : 'border-neutral-100 hover:border-neutral-200'
              ]"
            >
              <div class="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <span class="material-symbols-outlined text-neutral-400">devices</span>
              </div>
              <p class="text-[13px] font-medium text-black leading-snug">{{ product.name }}</p>
              <p class="text-[11px] text-warm-gray mt-1">${{ Number(product.price).toFixed(2) }}</p>
              <div
                v-if="featuredIds.includes(product.id)"
                class="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]"
              >
                <span class="material-symbols-outlined text-[14px]">check</span>
              </div>
            </button>
          </div>
        </div>

        <!-- New Drops -->
        <div class="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-medium text-black mb-1">New Drops</h2>
              <p class="text-sm text-warm-gray">{{ newDropIds.length }} selected (max 8)</p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-for="product in products"
              :key="`newdrop-${product.id}`"
              @click="toggleNewDrop(product.id)"
              :class="[
                'relative p-4 rounded-xl border text-left transition-all',
                newDropIds.includes(product.id)
                  ? 'border-black bg-neutral-50 shadow-outline'
                  : 'border-neutral-100 hover:border-neutral-200'
              ]"
            >
              <div class="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <span class="material-symbols-outlined text-neutral-400">devices</span>
              </div>
              <p class="text-[13px] font-medium text-black leading-snug">{{ product.name }}</p>
              <p class="text-[11px] text-warm-gray mt-1">${{ Number(product.price).toFixed(2) }}</p>
              <div
                v-if="newDropIds.includes(product.id)"
                class="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]"
              >
                <span class="material-symbols-outlined text-[14px]">check</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end">
          <button
            @click="save"
            :disabled="saving"
            class="px-8 py-3.5 bg-black text-white text-[13px] font-medium rounded-pill hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="saving" class="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
