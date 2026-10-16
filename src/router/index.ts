import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/landing/LandingPageView.vue'),
    meta: { standalone: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true },
  },
  // Universal /dashboard route with smart redirection
  {
    path: '/dashboard',
    name: 'Dashboard',
    redirect: () => {
      const auth = useAuthStore()
      if (auth.isSuperAdmin) return '/superadmin/dashboard'
      if (auth.isAdmin) return '/admin/dashboard'
      if (auth.isStudent) return '/student/dashboard'
      return '/teacher/dashboard'
    },
    meta: { requiresAuth: true },
  },
  // Dedicated Super Admin Dashboard & Secret Manager
  {
    path: '/superadmin/dashboard',
    name: 'SuperAdminDashboard',
    component: () => import('@/views/superadmin/SuperAdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  {
    path: '/superadmin/secrets',
    name: 'SuperAdminSecrets',
    component: () => import('@/views/superadmin/SuperAdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  // Dedicated Admin Dashboard
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  // Dedicated Teacher Dashboard
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: () => import('@/views/teacher/TeacherDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/classes',
    name: 'ClassList',
    component: () => import('@/views/academic/ClassListView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/classes/:id',
    name: 'ClassDetail',
    component: () => import('@/views/academic/ClassDetailView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/questions',
    name: 'QuestionBank',
    component: () => import('@/views/questions/QuestionBankView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/questions/:id',
    name: 'QuestionBankDetail',
    component: () => import('@/views/questions/QuestionBankDetailView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/exams',
    name: 'ExamList',
    component: () => import('@/views/exams/ExamListView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/exams/create',
    name: 'ExamCreate',
    component: () => import('@/views/exams/ExamCreateView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/exams/:id',
    name: 'ExamDetail',
    component: () => import('@/views/exams/ExamDetailView.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/exams/:id/monitor',
    alias: '/proctoring/exam/:id',
    name: 'LiveMonitoring',
    component: () => import('@/views/proctoring/LiveMonitoring.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/grading',
    name: 'GradingReview',
    component: () => import('@/views/grading/GradeReview.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/grading/:sessionId',
    alias: '/exams/:id/grading',
    name: 'GradingSessionReview',
    component: () => import('@/views/grading/GradeReview.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/analytics',
    name: 'AnalyticsDashboard',
    component: () => import('@/views/analytics/AnalyticsDashboard.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/exams/:id/analytics',
    alias: '/analytics/exam/:id',
    name: 'ExamAnalytics',
    component: () => import('@/views/analytics/AnalyticsDashboard.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  // Student Views
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: () => import('@/views/student/StudentDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/student/exam/:examId',
    name: 'ExamWorkspace',
    component: () => import('@/views/student/ExamWorkspace.vue'),
    meta: { requiresAuth: true, roles: ['student'], fullscreen: true },
  },
  {
    path: '/student/exam/:examId/result',
    alias: '/results/:sessionId',
    name: 'ExamResult',
    component: () => import('@/views/student/ExamResult.vue'),
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'] },
  },
  // Companion View (Mobile Phone Secondary Camera)
  {
    path: '/companion',
    alias: '/companion/pair',
    name: 'CompanionPair',
    component: () => import('@/views/companion/PairView.vue'),
    meta: { guestOnly: false, companion: true },
  },
  // Catch-all
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  function getRoleDashboard(): string {
    if (auth.isSuperAdmin) return '/superadmin/dashboard'
    if (auth.isAdmin) return '/admin/dashboard'
    if (auth.isStudent) return '/student/dashboard'
    return '/teacher/dashboard'
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next(getRoleDashboard())
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const userRole = auth.user?.role
      if (!userRole || !to.meta.roles.includes(userRole)) {
        return next(getRoleDashboard())
      }
    }
  }

  next()
})

export default router
