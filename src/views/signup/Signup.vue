<style scoped>
.signup-wrap {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
.txt-wrap {
    display: flex;
    justify-content: flex-end;
}
.login-txt:hover {
    display: inline-block;
    text-decoration: underline;
    cursor: pointer;
}
</style>

<template>
    <div class="signup-wrap">
        <h1>회원가입</h1>
        <woo-input v-model="userId" placeholder="아이디"/>
        <woo-input type="password" v-model="password" placeholder="비밀번호"/>
        <woo-input v-model="userName" placeholder="닉네임"/>
        <woo-input type="text" v-model="정답" placeholder="주인장 이름은?"/>
        <woo-button @click="signup">회원가입</woo-button>
        <div class="txt-wrap">
            <a @click="goToLogin" class="login-txt">로그인</a>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLoginStore } from '@/stores/loginStore';
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2/dist/sweetalert2.js';
import wooInput from '@/components/element/WooInput.vue';
import wooButton from '@/components/element/WooButton.vue';

const userId = ref();
const password = ref();
const userName = ref();
const 정답 = ref();

// 로그인 스토어
const loginStore = useLoginStore();

// 라우터
const router = useRouter();

// 회원가입
const signup = async () => {
    if (정답.value !== '우광현') {
        new Swal('너... 누구냐...', '', 'error');
        return;
    }

    try {
        await loginStore.signup(userId.value, password.value, userName.value);
    } catch (error) {
        new Swal('회원가입 실패', error.message, 'warning');
    }
}

// 로그인 페이지로 이동
const goToLogin = () => {
    router.push('/login');
}
</script>