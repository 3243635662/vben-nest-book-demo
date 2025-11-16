import { LAYOUT } from '@/router/constant';

// 将直接导入改为懒加载形式
export const Analysis = () => import('@/views/dashboard/analysis/index.vue');
export const Workbench = () => import('@/views/dashboard/workbench/index.vue');
export const EXCEPTION_COMPONENT = () => import('@/views/sys/exception/Exception.vue');

export const ROUTE_MAP = {
  Dashboard: LAYOUT,
  Analysis: Analysis,
  Workbench: Workbench,
  EXCEPTION_COMPONENT: EXCEPTION_COMPONENT,
};
