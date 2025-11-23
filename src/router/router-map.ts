// export const ROUTE_MAP = {
//   About: () => import('@/layouts/default/index.vue'),
//   AboutPage: () => import('@/views/sys/about/index.vue'),
//   Dashboard: () => import('@/layouts/default/index.vue'),
//   Analysis: () => import('@/views/dashboard/analysis/index.vue'),
//   Workbench: () => import('@/views/dashboard/workbench/index.vue'),
//   EXCEPTION_COMPONENT: () => import('@/views/sys/exception/Exception.vue'),
// };

// 这样一个个写还是太麻烦了 我们可以选择asyncRoutes做一个路由map
import { asyncRoutes } from './routes';

const newRoutes = {};
const generateRouteMap = (routes) => {
  routes.forEach((item) => {
    // 首先添加当前路由的映射
    if (item.name && item.component) {
      newRoutes[item.name] = item.component;
    }
    // 然后递归处理子路由
    if (item.children && item.children.length > 0) {
      generateRouteMap(item.children);
    }
  });
};
generateRouteMap(asyncRoutes);
export const ROUTE_MAP = newRoutes;
