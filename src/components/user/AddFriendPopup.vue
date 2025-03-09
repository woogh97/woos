<style scoped>
.popup-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}
.popup {
    width: 300px;
    background-color: var(--color-background-soft);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
.search-wrap {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
</style>

<template>
    <div v-if="showPopup" class="popup-wrap">
        <div class="popup">
            <h1>친구 추가</h1>
            <div class="search-wrap">
                <woo-input v-model="friendId" placeholder="친구 아이디"/>
            </div>
            <woo-button @click="addFriend">요청</woo-button>
            <woo-button @click="closePopup">닫기</woo-button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import wooInput from '@/components/element/WooInput.vue';
import wooButton from '@/components/element/WooButton.vue';
import { getDbOrigin } from '@/assets/js/api';
import { useLoginStore } from '@/stores/loginStore';

const loginStore = useLoginStore();

const friendId = ref('');

const currentSummoner = ref({});

const resetInput = () => {
    friendId.value = '';
    currentSummoner.value = {};
}

const addFriend = async () => {
    try {
        const userId = loginStore.getUserInfo().userId;

        const dbOrigin = getDbOrigin();
        const res = await fetch(`${dbOrigin}/addFriend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, friendId: friendId.value })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data);
        }

        new Swal({
            title: '친구 추가 요청',
            text: '친구 추가 요청을 보냈습니다.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        closePopup();
    } catch (error) {
        new Swal(error.message, '', 'warning');
    }
}

const showPopup = ref(false);

const openPopup = () => {
    showPopup.value = true;
}

const closePopup = () => {
    resetInput();
    showPopup.value = false;
}

defineExpose({
    openPopup
})
</script>