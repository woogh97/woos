<style scoped lang='scss'>

</style>

<template>
    <div>
        <h1>로그인</h1>
        <input type="text" placeholder="아이디" v-model="userId"/>
        <input type="password" placeholder="비밀번호" v-model="password"/>
        <button @click="login">로그인</button>
        <button @click="openSignupPopup">회원가입</button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLoginStore } from '@/stores/loginStore';
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2/dist/sweetalert2.js';

// 로그인 스토어
const loginStore = useLoginStore();

// 라우터
const router = useRouter();

// 아이디
const userId = ref();

// 비밀번호
const password = ref();

// 로그인
const login = () => {
    loginStore.login(userId.value, password.value);
}

// 회원가입 팝업 열기
const openSignupPopup = () => {
    router.push('/signup');
}

</script>