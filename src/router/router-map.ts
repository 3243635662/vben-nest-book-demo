export const ROUTE_MAP = {
  About: () => import('@/layouts/default/index.vue'),
  AboutPage: () => import('@/views/sys/about/index.vue'),
  Dashboard: () => import('@/layouts/default/index.vue'),
  Analysis: () => import('@/views/dashboard/analysis/index.vue'),
  Workbench: () => import('@/views/dashboard/workbench/index.vue'),
  EXCEPTION_COMPONENT: () => import('@/views/sys/exception/Exception.vue'),
};
