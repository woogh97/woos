<style scoped>
.login-wrap {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
.signup-txt:hover {
    display: inline-block;
    text-decoration: underline;
    cursor: pointer;
}
</style>

<template>
    <div class="login-wrap">
        <h1>로그인</h1>
        <woo-input v-model="userId" placeholder="아이디"/>
        <woo-input type="password" v-model="password" placeholder="비밀번호"/>
        <woo-button @click="login">로그인</woo-button>
        <div>
            <a @click="openSignupPopup" class="signup-txt">회원가입</a>
        </div>
        <!-- <woo-button @click="openSignupPopup">회원가입</woo-button> -->
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLoginStore } from '@/stores/loginStore';
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2/dist/sweetalert2.js';
import wooInput from '@/components/element/WooInput.vue';
import wooButton from '@/components/element/WooButton.vue';

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