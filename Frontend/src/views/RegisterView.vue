<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('CUSTOMER')
const localError = ref('')

// Reactive visibility states
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleRegister() {
  localError.value = ''

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    localError.value = 'Password must be at least 8 characters'
    return
  }
  if (password.value.length > 100) {
    localError.value = 'Password must be less than 100 characters'
    return
  } 
  if (name.value.length < 2) {
    localError.value = 'Name must be at least 2 characters'
    return
  }
  if (name.value.length > 50) {
    localError.value = 'Name must be less than 50 characters'
    return
  }
  if (!email.value.includes('@')) {
    localError.value = 'Invalid email'
    return
  }

  const success = await auth.register(name.value, email.value, password.value, role.value)
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-5">
    <div class="w-full max-w-sm">
      <div class="mb-10">
        <h1 class="text-3xl font-light text-black tracking-tight mb-2">Create Account</h1>
        <p class="text-charcoal text-sm">Join AppleVault today.</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Full Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors"
            placeholder="Example Name"
          />
        </div>

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
          <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Account Type</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="role = 'CUSTOMER'"
              :class="[
                'py-3 border rounded-xl text-[13px] font-medium transition-all',
                role === 'CUSTOMER' ? 'border-black bg-neutral-50 text-black' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
              ]"
            >
              Customer
            </button>
            <button
              type="button"
              @click="role = 'SELLER'"
              :class="[
                'py-3 border rounded-xl text-[13px] font-medium transition-all',
                role === 'SELLER' ? 'border-black bg-neutral-50 text-black' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
              ]"
            >
              Seller
            </button>
          </div>
        </div>

        <!-- Password Field Container -->
        <div>
          <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Password</label>
          <div class="relative w-full">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-12 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors"
              placeholder="Min 8 characters"
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

        <!-- Confirm Password Field Container -->
        <div>
          <label class="block text-[11px] font-medium uppercase tracking-cta text-neutral-500 mb-1.5">Confirm Password</label>
          <div class="relative w-full">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-12 py-3 text-[15px] text-black focus:outline-none focus:border-black transition-colors"
              placeholder="********"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors focus:outline-none"
            >
              <span class="text-sm select-none">{{ showConfirmPassword ? 'Hide' : 'Show' }}</span>
            </button>
          </div>
        </div>

        <div v-if="localError || auth.error" class="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {{ localError || auth.error }}
        </div>

        <button
          type="submit"
          :disabled="auth.loading"
          class="w-full py-4 bg-black text-white font-label-caps text-label-caps tracking-[0.2em] hover:bg-neutral-800 active:scale-[0.98] transition-all rounded-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="auth.loading" class="inline-block w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ auth.loading ? 'Creating...' : 'Create Account' }}
        </button>
      </form>

      <p class="mt-8 text-center text-[13px] text-neutral-500">
        Already have an account?
        <router-link to="/login" class="text-black font-medium hover:underline">Sign in</router-link>
      </p>
    </div>
  </div>
</template>