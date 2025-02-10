<style scoped>

</style>

<template>
엔탑회's 놀이터
</template>

<script setup>
import { ref } from 'vue'

const gameName = ref();
const tagLine = ref();

async function getWorstDamageDealer() {
  try {
    const res = await fetch(`https://a0kvtebzrb.execute-api.ap-southeast-2.amazonaws.com/getWorstDamageDealer`, {
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

const userId = ref();
const password = ref();
async function signup() {
  if (!userId || !password) {
    alert('아이디와 비밀번호는 필수입니다.');
    return;
  }

  try {
    
    const res = await fetch(`https://a0kvtebzrb.execute-api.ap-southeast-2.amazonaws.com/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId.value,
        password: password.value,
      })
    });

    const data = await res.json();
    console.log(data.message);
    alert(data.message);
  } catch (error) {
    console.error(error);
    alert(error);
  }
}

function BE연동테스트() {
  console.log('BE연동테스트');
  fetch('https://a0kvtebzrb.execute-api.ap-southeast-2.amazonaws.com/test')
    .then((response) => response.json())
    .then((data) => alert(data));
}
</script>