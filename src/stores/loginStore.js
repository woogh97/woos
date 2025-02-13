import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { useRouter } from 'vue-router';

export const useLoginStore = defineStore('login', () => {
  // 라우터
  const router = useRouter();

  // 유저정보
  const userInfo = ref({});

  // 로그인 여부
  const isLogin = computed(() => !!userInfo.value.userId);

  // 유저정보 셋팅
  const setUserInfo = (data) => {
    userInfo.value = data;
  }

  // 유저정보 가져오기
  const getUserInfo = () => {
    return userInfo.value;
  }

  // 로그인 여부 가져오기
  const getIsLogin = () => {
    return isLogin.value;
  }

  // 로그인
  const login = async (userId, password) => {
    try {
      const res = await fetch(`https://35ffm6acpb.execute-api.ap-northeast-2.amazonaws.com/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          password: password,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      
      const data = await res.json();
      userInfo.value = { userId: data.userId, userName: data.userName };
      router.push('/');
    } catch (error) {
      new Swal({
        icon: 'error',
        title: '로그인 실패',
        text: error.message,
      });
    }
  }

  // 로그아웃
  const logout = () => {
    setUserInfo({});
    router.push('/login');
  }

  // 회원가입
  const signup = async (userId, password, userName) => {
    if (!userId || !password || !userName) {
      new Swal({
        icon: 'error',
        title: '아이디와 비밀번호, 닉네임은 필수입니다.',
      });
      return;
    }

    try {
      const res = await fetch(`https://35ffm6acpb.execute-api.ap-northeast-2.amazonaws.com/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          userName: userName,
          password: password,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setUserInfo({ userId, userName });
      router.push('/');
    } catch (error) {
      new Swal({
        icon: 'error',
        title: '회원가입 실패',
        text: error.message,
      });
    }
  }

  return { userInfo, getUserInfo, login, logout, signup, getIsLogin };
}, {
  persist: true,
})
