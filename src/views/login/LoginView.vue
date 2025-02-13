<style scoped>
.login-wrap {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
@media (min-width: 1024px) {
    .login-wrap {
        min-width: 300px;
    }
}
.txt-wrap {
    display: flex;
    justify-content: flex-end;
}
.txt-wrap > div:not(:first-child)::before {
    content: '│';
    padding: 2px;
}
.signup-txt:hover {
    display: inline-block;
    text-decoration: underline;
    cursor: pointer;
}
</style>

<template>
    <div class="login-wrap" @keydown.enter="login">
        <h1>로그인</h1>
        <woo-input v-model="userId" placeholder="아이디"/>
        <woo-input type="password" v-model="password" placeholder="비밀번호"/>
        <woo-button @click="login">로그인</woo-button>
        <div class="txt-wrap">
            <div>
                <a @click="아이디찾기" class="signup-txt">아이디 찾기</a>
            </div>
            <div>
                <a @click="비밀번호찾기" class="signup-txt">비밀번호 찾기</a>
            </div>
            <div>
                <a @click="goToSignup" class="signup-txt">회원가입</a>
            </div>
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

// 회원가입 페이지로 이동
const goToSignup = () => {
    router.push('/signup');
}

const 아이디찾기 = () => {
    new Swal('아직 안되지요~', '', '');
}

const 비밀번호찾기 = () => {
    new Swal('아직 안되지요~', '', '');
}

</script>