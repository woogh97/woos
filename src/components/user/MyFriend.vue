<style scoped lang='scss'>
.friend-cont {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    .friend-wrap {
        padding: 10px 5px;
        border: 2px solid #b3b3b3;
        border-radius: 5px;
        background-color: var(--color-background-soft);
        .friend-pending-wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .friend-btn-wrap {
                display: flex;
                column-gap: 5px;
            }
        }
    }
}
</style>

<template>
    <div class="friend-cont">
        <div>
            <woo-button @click="openAddFriendPopup">대충 친추 버튼</woo-button>
            <add-friend-popup ref="addFriendPopup"></add-friend-popup>
        </div>
        <div>
            <ul>
                <li class="friend-wrap" v-for="friend in friends" :key="friend.id">
                    <div class="friend-pending-wrap" v-if="friend.user_id === userId && friend.status === 'pending'">
                        <span class="friend-pending-name">{{ friend.name }}</span>
                        <div class="friend-btn-wrap">
                            <woo-button @click="acceptFriend(friend.user_id)">수락</woo-button>
                            <woo-button @click="rejectFriend(friend.user_id)">거절</woo-button>
                        </div>
                    </div>
                    <div class="friend-accepted-wrap" v-else-if="friend.status === 'accepted'">
                        <div class="friend-profile"></div>
                        <span class="friend-name">{{ friend.name }}</span>
                    </div>
                </li>
                <li class="amumu-wrap" v-if="friends.filter(it => it.user_id !== userId && it.status === 'accepted').length === 0">
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
        const res = await fetch(`${dbOrigin}/changeFriendStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId.value, friendId, status: 'accepted' })
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
        const res = await fetch(`${dbOrigin}/changeFriendStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId.value, friendId, status: 'reject' })
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