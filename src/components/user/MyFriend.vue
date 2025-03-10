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
                    <div v-if="friend.user_id === userId && friend.status === 'pending'">
                        <span>{{ friend.name }}</span>
                        <woo-button @click="acceptFriend(friend.user_id)">수락</woo-button>
                        <woo-button @click="rejectFriend(friend.user_id)">거절</woo-button>
                    </div>
                    <div v-else>
                        <span>{{ friend.name }}</span>
                        <span>{{ friend.status }}</span>
                    </div>
                </li>
                <li v-if="friends.filter(it => it.user_id !== userId).length === 0">
                    <div>
                        <span>아무무 입니까?</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import WooInput from '../element/WooInput.vue';
import WooButton from '../element/WooButton.vue';
import { useSocketStore } from '../../stores/socketStore';
import { useLoginStore } from '@/stores/loginStore';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { getDbOrigin } from '@/assets/js/api';
import AddFriendPopup from './AddFriendPopup.vue';

const loginStore = useLoginStore();

const socketStore = useSocketStore();
socketStore.connectSocket();

const receiverId = ref();
const message = ref();

const friends = ref([]);
const userId = computed(() => loginStore.getUserInfo().userId);

const getFriends = async () => {
    const dbOrigin = getDbOrigin();
    try {
        const res = await fetch(`${dbOrigin}/getFriends?userId=${userId.value}`);
        const data = await res.json();
        friends.value = data;
    } catch (error) {
        console.error(error);
    }
}
getFriends();

const acceptFriend = async (friendId) => {
    try {
        const dbOrigin = getDbOrigin();
        const res = await fetch(`${dbOrigin}/acceptFriend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId.value, friendId })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data);
        }

        getFriends();
    } catch (error) {
        new Swal(error.message, '', 'warning');
    }
}

const rejectFriend = async (friendId) => {
    try {
        const dbOrigin = getDbOrigin();
        const res = await fetch(`${dbOrigin}/rejectFriend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId.value, friendId })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data);
        }

        getFriends();
    } catch (error) {
        new Swal(error.message, '', 'warning');
    }
}

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