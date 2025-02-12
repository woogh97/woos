import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/main/MainView.vue'
import { useLoginStore } from "@/stores/loginStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/main',
    }, {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginView.vue'),
    }, {
      path: '/main',
      name: 'Main',
      component: () => import('@/views/main/MainView.vue'),
    }
  ],
})

router.beforeEach((to, from, next) => {
  const loginStore = useLoginStore();

  const isLogin = loginStore.getIsLogin();
  if (!isLogin && to.path !== '/login') {
    next('/login');
    return;
  }

  if (isLogin && to.path === '/login') {
    next('/main');
    return;
  }
  next();
});

export default router
