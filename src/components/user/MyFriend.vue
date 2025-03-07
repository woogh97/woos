<style scoped lang='scss'>

</style>

<template>
    <div>
        <div>
            <woo-button @click="openAddFriendPopup">대충 친추 버튼</woo-button>
            <add-friend-popup ref="addFriendPopup"></add-friend-popup>
        </div>
        <div>
            <ul>
                <li v-for="friend in friends" :key="friend.id">
                    <div>
                        <span>{{ friend.name }}</span>
                    </div>
                </li>
                <li v-if="friends.length === 0">
                    <div>
                        <span>아무무 입니다.</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import WooInput from '../element/WooInput.vue';
import WooButton from '../element/WooButton.vue';
import { useSocketStore } from '../../stores/socketStore';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import AddFriendPopup from './AddFriendPopup.vue';

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

const addFriendPopup = ref();
const openAddFriendPopup = () => {
    addFriendPopup.value.openPopup();
}
</script>