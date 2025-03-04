<script setup>
import { RouterView } from 'vue-router'
import { useSocketStore } from './stores/socketStore';
import { ref } from 'vue';

const socketStore = useSocketStore();
socketStore.connectSocket();

const deferredPrompt = ref(null);
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt Event fired');
  deferredPrompt.value = e;
});
</script>

<template>
  {{ deferredPrompt ?? '널' }}
  <RouterView />
</template>

<style scoped>

</style>
