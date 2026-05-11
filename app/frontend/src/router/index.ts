import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useShiftsStore } from '@/stores/shifts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingView.vue')
    },
    {
      path: '/portal',
      name: 'portal',
      component: () => import('../views/PortalView.vue')
    },
    {
      path: '/p/:code',
      name: 'company-portal',
      component: () => import('../views/PortalView.vue')
    },
    {
      path: '/dashboard',
      redirect: '/app/dashboard'
    },
    {
      path: '/app',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path: 'ventas',
          name: 'ventas',
          component: () => import('../views/VentasView.vue')
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('../views/AdminView.vue')
        },
        {
          path: 'ajustes',
          name: 'ajustes',
          component: () => import('../views/SettingsView.vue')
        },
        {
          path: 'inventario',
          name: 'inventario',
          component: () => import('../views/InventoryView.vue')
        },
        {
          path: 'facturas',
          name: 'facturas',
          component: () => import('../views/InvoicesView.vue')
        },
        {
          path: 'reportes',
          name: 'reportes',
          component: () => import('../views/ReportsView.vue')
        },
        {
          path: 'estadisticas',
          name: 'estadisticas',
          component: () => import('../views/StatisticsView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  // If we have a token but no user, try to get the profile first
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchEmployees()
    } catch (e) {
      console.error('Session restoration failed')
    }
  }

  const isAuthenticated = !!authStore.token && !!authStore.user

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    return '/portal'
  }
  
  if (to.path === '/portal' && isAuthenticated) {
    return '/app/dashboard'
  }

  if (to.name === 'ventas') {
    const shiftsStore = useShiftsStore()
    // Try to fetch current shift if not present
    if (!shiftsStore.currentShift) {
      await shiftsStore.fetchCurrentShift()
    }
    
    if (!shiftsStore.currentShift) {
      return '/app/dashboard'
    }
  }
  
  return true
})

export default router
