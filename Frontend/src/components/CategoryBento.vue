<script setup>
import { ref } from 'vue'

const categories = ref([
  { id: 1, title: 'iPhones', subtitle: 'Latest Models', icon: 'smartphone', gridClass: 'md:col-span-4 md:row-span-1' },
  { id: 2, title: 'iPads', subtitle: 'Tablets & More', icon: 'tablet_mac', gridClass: 'md:col-span-2 md:row-span-2' },
  { id: 3, title: 'AirPods', subtitle: 'Wireless Audio', icon: 'headphones', gridClass: 'md:col-span-4 md:row-span-1' }
])
</script>

<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-5 md:px-6">
      <div class="mb-10 md:mb-14">
        <span class="text-[11px] font-medium uppercase tracking-cta text-warm-gray mb-2 block">Browse</span>
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-light text-black tracking-tight leading-[1.15]">Shop by Category</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-6 grid-rows-[auto] md:grid-rows-2 gap-4 md:gap-5 md:h-[640px]">
        <div
          v-for="category in categories"
          :key="category.id"
          :class="['relative group cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl min-h-[240px] md:min-h-0 bg-neutral-50 flex items-center justify-center shadow-outline hover:shadow-card transition-shadow duration-300', category.gridClass]"
        >
          <div class="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-all"></div>

          <div class="z-10 flex flex-col items-center justify-center gap-4 md:gap-5">
            <span class="material-symbols-outlined text-5xl md:text-6xl text-neutral-300 group-hover:text-black transition-colors duration-300">{{ category.icon }}</span>
          </div>

          <div class="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10">
            <h3 class="text-2xl md:text-3xl lg:text-4xl font-light text-black tracking-tight leading-[1.1] mb-1">
              {{ category.title }}
            </h3>
            <p class="text-[13px] md:text-sm text-charcoal tracking-wide">
              {{ category.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
