<style scoped lang='scss'>

</style>

<template>
    <div>
        대충 친구목록
        <woo-input placeholder="임시 귓말 상대" v-model="receiverId"></woo-input>
        <woo-input placeholder="임시 귓말 내용" v-model="message"></woo-input>
        <woo-button @click="sendMessage">귓말 보내기</woo-button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import WooInput from '../element/WooInput.vue';
import WooButton from '../element/WooButton.vue';
import { useSocketStore } from '../../stores/socketStore';
import Swal from 'sweetalert2/dist/sweetalert2.js';

const socketStore = useSocketStore();

const receiverId = ref();
const message = ref();

const sendMessage = () => {
    if (!receiverId.value || !message.value) {
        new Swal('귓말 상대와 내용을 입력해주세요.', '', 'warning');
        return;
    }
    socketStore.sendMessage(receiverId.value, message.value);
}

</script>