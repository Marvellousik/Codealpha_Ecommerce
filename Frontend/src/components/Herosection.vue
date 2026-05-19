<script setup>
</script>

<template>
  <section class="relative bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-5 md:px-6 pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-24 text-center">
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-light text-black leading-[1.08] tracking-display mb-6 md:mb-8">
        Premium<br class="md:hidden" /> Apple Devices
      </h1>
      <p class="text-base md:text-lg lg:text-xl text-charcoal leading-relaxed tracking-body max-w-xl mx-auto mb-10 md:mb-12">
        Your trusted destination for iPhones, iPads, AirPods, and Apple accessories. Genuine products, unbeatable prices.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
        <router-link to="/search" class="w-full sm:w-auto px-7 py-3.5 bg-black text-white text-[15px] font-medium rounded-pill hover:bg-neutral-800 transition-all active:scale-[0.98] text-center">
          Shop Now
        </router-link>
        <router-link to="/search" class="w-full sm:w-auto px-7 py-3.5 bg-warm-stone/80 text-black text-[15px] font-medium rounded-warm hover:bg-warm-stone transition-all active:scale-[0.98] shadow-warm text-center">
          View Collections
        </router-link>
      </div>
    </div>
  </section>
</template>
