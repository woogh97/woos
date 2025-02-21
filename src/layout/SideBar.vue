<style scoped>
.sidebar-wrap {
    padding: 10px;
}
</style>

<template>
    <aside class="sidebar-wrap">
        <MyAccount></MyAccount>
        <MyFriend></MyFriend>
    </aside>
</template>

<script setup>
import MyAccount from '@/components/user/MyAccount.vue';
import MyFriend from '@/components/user/MyFriend.vue';

</script>