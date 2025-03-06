import { defineStore } from 'pinia'
import { useLoginStore } from './loginStore';
import { getDbOrigin } from '@/assets/js/api';

export const useSocketStore = defineStore('socket', () => {
  const loginStore = useLoginStore();
  let socket = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  const connectSocket = () => {
    socket = new WebSocket(`wss://2ker7kkj7f.execute-api.ap-northeast-2.amazonaws.com/production`);
    socket.onopen = () => {
      reconnectAttempts = 0;
      const userInfo = loginStore.getUserInfo();
      console.log('WebSocket connected');
      socket.send(JSON.stringify({ action: 'registerUser', userId: userInfo.userId }));
    }
    socket.onmessage = (event) => {
      console.log('WebSocket message start');
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
    }
    socket.onclose = () => {
      console.log('WebSocket closed');
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++;
          connectSocket();
        }, 1000);
      }
    }
  }

  const sendMessage = async (receiverId, message) => {
    const userInfo = loginStore.getUserInfo();
    const dbOrigin = getDbOrigin();

    const res = await fetch(`${dbOrigin}/saveMessageAndGetConnectionId`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        receiverId,
        userId: userInfo.userId,
        message,
      })
    });

    const { connectionId } = await res.json();

    socket.send(JSON.stringify({ connectionId, userId: userInfo.userId, message }));
  }

  return { socket, connectSocket, sendMessage };
})
