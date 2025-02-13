<style scoped>

</style>

<template>
엔탑회's {{ userName }} 놀이터
<button @click="logout">로그아웃</button>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLoginStore } from '@/stores/loginStore';

const loginStore = useLoginStore();
const userName = computed(() => loginStore.getUserInfo().userName);

const gameName = ref();
const tagLine = ref();

const logout = () => {
  loginStore.logout();
}

async function getWorstDamageDealer() {
  try {
    const res = await fetch(`https://35ffm6acpb.execute-api.ap-northeast-2.amazonaws.com/getWorstDamageDealer`, {
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

</script>