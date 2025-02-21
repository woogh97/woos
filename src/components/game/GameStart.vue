<style scoped lang='scss'>

</style>

<template>
    <div>
        <WooButton @click="chooseGame">대충 게임 시작 버튼</WooButton>
        <span v-show="showMsg">{{ msg }}</span>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import WooButton from '../element/WooButton.vue';

const msg = ref('아직 없음 ㅎ');
const showMsg = ref(false);
const chooseGame = () => {
    showMsg.value = !showMsg.value;
}

</script>