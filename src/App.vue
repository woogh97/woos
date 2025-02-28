<script setup>
import { RouterView } from 'vue-router'
import { useSocketStore } from './stores/socketStore';

const socketStore = useSocketStore();
socketStore.connectSocket();
</script>

<template>
  <RouterView />
</template>

<style scoped>

</style>
