<script setup>
import { RouterView } from 'vue-router'
import { useSocketStore } from './stores/socketStore';
import { ref } from 'vue';

const socketStore = useSocketStore();
socketStore.connectSocket();

window.addEventListener('beforeinstallprompt', (e) => {
  debugger;
  e.prompt();
});
</script>

<template>
  <RouterView />
</template>

<style scoped>

</style>
