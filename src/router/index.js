import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
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

export default router
