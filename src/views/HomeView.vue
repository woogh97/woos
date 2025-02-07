<style scoped>

</style>

<template>
엔탑회's 놀이터

<button @click="BE연동테스트">BE연동테스트</button>>
</template>

<script setup>
function BE연동테스트() {
  console.log('BE연동테스트');
  fetch('https://a0kvtebzrb.execute-api.ap-southeast-2.amazonaws.com/test')
    .then((response) => response.json())
    .then((data) => alert(data));
}
</script>