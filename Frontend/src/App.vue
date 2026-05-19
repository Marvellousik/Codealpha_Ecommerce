<script setup>
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen min-h-[75vh] flex flex-col">
    <NavBar />
    
    <main class="flex-grow">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>
