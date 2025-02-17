<style scoped>
.txt-wrap {
    display: flex;
    justify-content: flex-end;
    font-size: small;
}
.a-txt:hover {
    display: inline-block;
    text-decoration: underline;
    cursor: pointer;
}
.header-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 10px;
}
</style>

<template>
  <div class="header-wrap">
    <div>{{ userName }}</div>
    <div class="txt-wrap">
      <a @click="logout" class="a-txt">로그아웃</a>
    </div>
  </div>
  <MyAccount />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLoginStore } from '@/stores/loginStore';
import MyAccount from '@/components/user/MyAccount.vue';

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