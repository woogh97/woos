<script setup>
import { RouterView } from 'vue-router'
import { ref } from 'vue';
import Swal from 'sweetalert2/dist/sweetalert2.js';

const beforeInstallPrompt = ref(null);
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  beforeInstallPrompt.value = e;

  new Swal({
    title: '앱 설치',
    text: '이 앱을 설치하시겠습니까?',
    showCancelButton: true,
    confirmButtonText: '네',
    cancelButtonText: '아니요',
  }).then((result) => {
    if (result.isConfirmed) {
      beforeInstallPrompt.value.prompt();
    }
  })
});
</script>

<template>
  <RouterView />
</template>

<style scoped>

</style>
