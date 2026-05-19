import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetailView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      beforeEnter: (_to, _from, next) => {
        const userStr = localStorage.getItem('user')
        if (!userStr) return next('/')
        try {
          const user = JSON.parse(userStr)
          if (user.role === 'ADMIN') return next()
        } catch { /* ignore */ }
        return next('/')
      }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
