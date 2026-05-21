import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../api/client'

export interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    imageUrl: string | null
    stock: number
    category: { name: string } | null
    seller: { name: string | null } | null
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  async function fetchCart() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get('/cart')
      items.value = res.data.data.items
      total.value = res.data.data.total
    } catch (err: any) {
      if (err.response?.status === 401) {
        items.value = []
        total.value = 0
      } else {
        error.value = err.response?.data?.error || 'Failed to load cart'
      }
    } finally {
      loading.value = false
    }
  }

  async function addToCart(productId: string, quantity: number = 1) {
    loading.value = true
    error.value = null
    try {
      await apiClient.post('/cart', { productId, quantity })
      await fetchCart()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to add to cart'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    loading.value = true
    error.value = null
    try {
      await apiClient.patch(`/cart/${itemId}`, { quantity })
      await fetchCart()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update cart'
      return false
    } finally {
      loading.value = false
    }
  }

  async function removeItem(itemId: string) {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete(`/cart/${itemId}`)
      await fetchCart()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to remove item'
      return false
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete('/cart')
      items.value = []
      total.value = 0
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to clear cart'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    total,
    loading,
    error,
    itemCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  }
})
