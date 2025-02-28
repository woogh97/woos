import { defineStore } from 'pinia'
import { useLoginStore } from './loginStore';

export const useSocketStore = defineStore('socket', () => {
  const loginStore = useLoginStore();
  let socket = null;

  const connectSocket = () => {
    socket = new WebSocket(`wss://2ker7kkj7f.execute-api.ap-northeast-2.amazonaws.com/production`);
    socket.onopen = () => {
      const userInfo = loginStore.getUserInfo();
      console.log('WebSocket connected');
      socket.send(JSON.stringify({ action: 'registerUser', userId: userInfo.userId }));
    }
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
    }
  }

  const sendMessage = (receiverId, message) => {
    const userInfo = loginStore.getUserInfo();
    socket.send(JSON.stringify({ receiverId, userId: userInfo.userId, message }));
  }

  return { socket, connectSocket, sendMessage };
})
