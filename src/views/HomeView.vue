<style scoped>

</style>

<template>
엔탑회's 놀이터

<input v-model="gameName" placeholder="닉네임"/>
<input v-model="tagLine" placeholder="태그라인"/>
<button @click="getWorstDamageDealer">마지막 게임 딜량 꼴등 찾기</button>

</template>

<script setup>
import { ref } from 'vue'

const gameName = ref();
const tagLine = ref();

async function getWorstDamageDealer() {
  try {
    const res = await fetch(`https://a0kvtebzrb.execute-api.ap-southeast-2.amazonaws.com`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameName: gameName.value,
        tagLine: tagLine.value
      })
    });

    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

function BE연동테스트() {
  console.log('BE연동테스트');
  fetch('https://a0kvtebzrb.execute-api.ap-southeast-2.amazonaws.com/test')
    .then((response) => response.json())
    .then((data) => alert(data));
}
</script>