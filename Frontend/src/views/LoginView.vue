Here is your updated login form. I applied the exact same clean pattern: a single `showPassword` reactive ref, a relative layout wrapper on the input field, and absolute positioning for the toggle text action to match the **AppleVault** aesthetic perfectly.

```vue
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')

// Reactive visibility state
const showPassword = ref(false)

async function handleLogin() {
  const success = await auth.login(email.value, password.value)
  if (success) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
}
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-5">
    <div class="w-full max-w-sm">
      <div class="mb-10">
        <h1 class="text-3xl font-light text-black tracking-tight mb-2">Sign In</h1>
        <p class="text-charcoal text-sm">Access your AppleVault account.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Password</label>
          <div class="relative w-full">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-12 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors"
              placeholder="********"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors focus:outline-none"
            >
              <span class="text-sm select-none">{{ showPassword ? 'Hide' : 'Show' }}</span>
            </button>
          </div>
        </div>

        <div v-if="auth.error" class="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {{ auth.error }}
        </div>

        <button
          type="submit"
          :disabled="auth.loading"
          class="w-full py-4 bg-black text-white font-label-caps text-label-caps tracking-[0.2em] hover:bg-neutral-800 active:scale-[0.98] transition-all rounded-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="auth.loading" class="inline-block w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ auth.loading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <p class="mt-8 text-center text-[13px] text-neutral-500">
        Don't have an account?
        <router-link to="/register" class="text-black font-medium hover:underline">Create one</router-link>
      </p>
    </div>
  </div>
</template>

```