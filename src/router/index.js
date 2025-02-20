import { createRouter, createWebHistory } from 'vue-router'
import { useLoginStore } from "@/stores/loginStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginView.vue'),
    }, {
      path: '/signup',
      name: 'Signup',
      component: () => import('@/views/signup/Signup.vue'),
    }, {
      path: '/',
      redirect: '/main',
      component: () => import('@/layout/AppMain.vue'),
      children: [
        {
          path: '/main',
          name: 'Main',
          component: () => import('@/views/main/MainView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const loginStore = useLoginStore();

  const isLogin = loginStore.getIsLogin();
  if (!isLogin && to.path !== '/login' && to.path !== '/signup') {
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
