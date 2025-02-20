<style scoped>
.header-wrap {
    /* background-color: #0c0f17; */
    padding: 20px;
    border-bottom: 2px solid var(--color-border);
    display: flex;
    height: var(--header-height);
}
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
.user-info-wrap {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 10px;
}
</style>

<template>
    <header class="header-wrap">
        <div class="user-info-wrap">
            <div>{{ userName }}</div>
            <div class="txt-wrap">
            <a @click="logout" class="a-txt">로그아웃</a>
            </div>
        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue'
import { useLoginStore } from '@/stores/loginStore';

const loginStore = useLoginStore();
const userName = computed(() => loginStore.getUserInfo().userName);

const logout = () => {
  loginStore.logout();
}
</script>