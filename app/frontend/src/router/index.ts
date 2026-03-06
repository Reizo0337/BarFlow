import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/ventas',
      name: 'ventas',
      component: () => import('../views/VentasView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue')
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: () => import('../views/ReportsView.vue')
    }
  ],
})

export default router
