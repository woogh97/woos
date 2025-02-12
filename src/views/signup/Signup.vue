<style scoped>

</style>

<template>
    <div>
        <input v-model="userId" placeholder="아이디">
        <input type="password" v-model="password" placeholder="비밀번호">
        <input type="text" v-model="정답" placeholder="주인장 이름은?">
        <button @click="signup">회원가입</button>
    </div>    
</template>

<script setup>
import { ref } from 'vue'
import { useLoginStore } from '@/stores/loginStore';
import Swal from 'sweetalert2/dist/sweetalert2.js';

const userId = ref();
const password = ref();
const 정답 = ref();

const loginStore = useLoginStore();

const signup = async () => {
    if (정답.value !== '우광현') {
        new Swal('너... 누구냐...', '', 'error');
        return;
    }

    try {
        await loginStore.signup(userId.value, password.value);
    } catch (error) {
        new Swal('회원가입 실패', error.message, 'warning');
    }
}

</script>