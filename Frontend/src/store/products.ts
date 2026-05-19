import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../api/client'

export interface ApiProduct {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  categoryId: string
  category: { id: string; name: string }
  seller: { id: string; name: string | null }
  createdAt: string
}

export const useProductStore = defineStore('products', () => {
  const products = ref<ApiProduct[]>([])
  const featured = ref<ApiProduct[]>([])
  const newDrops = ref<ApiProduct[]>([])
  const currentProduct = ref<ApiProduct | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const meta = ref<any>(null)

  const allProducts = computed(() => products.value)

  async function fetchProducts(params?: Record<string, any>) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get('/products', { params })
      products.value = res.data.data
      meta.value = res.data.meta
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(id: string) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get(`/products/${id}`)
      currentProduct.value = res.data.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load product'
      currentProduct.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchFeatured() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get('/config/featured')
      featured.value = res.data.data.featured
      newDrops.value = res.data.data.newDrops
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load featured'
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    featured,
    newDrops,
    currentProduct,
    loading,
    error,
    meta,
    allProducts,
    fetchProducts,
    fetchProduct,
    fetchFeatured,
  }
})
