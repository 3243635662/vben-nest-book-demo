import type { AppRouteRecordRaw, Menu } from '@/router/types';

import { defineStore } from 'pinia';
import { store } from '@/store';
import { useI18n } from '@/hooks/web/useI18n';
import { useUserStore } from './user';
import { useAppStoreWithOut } from './app';
import { toRaw } from 'vue';
import { transformObjToRoute, flatMultiLevelRoutes } from '@/router/helper/routeHelper';
import { transformRouteToMenu, transformMenuModules } from '@/router/helper/menuHelper';
import projectSetting from '@/settings/projectSetting';
import { PermissionModeEnum } from '@/enums/appEnum';
import { menuModules } from '@/router/menus';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic';
import { filter } from '@/utils/helper/treeHelper';
import { getMenuList, getAllMenuList } from '@/api/sys/menu';
import { getPermCode } from '@/api/sys/user';
import { useMessage } from '@/hooks/web/useMessage';
import { PageEnum } from '@/enums/pageEnum';
import { ROUTE_MAP } from '@/router/router-map';

const { createMessage } = useMessage();
interface PermissionState {
  // Permission code list
  // 权限代码列表
  permCodeList: string[] | number[];
  // Whether the route has been dynamically added
  // 路由是否动态添加
  isDynamicAddedRoute: boolean;
  // To trigger a menu update
  // 触发菜单更新
  lastBuildMenuTime: number;
  // Backstage menu list
  // 后台菜单列表
  backMenuList: Menu[];
  // 菜单列表
  frontMenuList: Menu[];
  staticMenuList: Menu[];
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    // 权限代码列表
    permCodeList: [],
    // Whether the route has been dynamically added
    // 路由是否动态添加
    isDynamicAddedRoute: false,
    // To trigger a menu update
    // 触发菜单更新
    lastBuildMenuTime: 0,
    // Backstage menu list
    // 后台菜单列表
    backMenuList: [],
    // menu List
    // 菜单列表
    frontMenuList: [],
    staticMenuList: [],
  }),
  getters: {
    getPermCodeList(state): string[] | number[] {
      return state.permCodeList;
    },
    getBackMenuList(state): Menu[] {
      return state.backMenuList;
    },
    getFrontMenuList(state): Menu[] {
      return state.frontMenuList;
    },
    getStaticMenuList(state): Menu[] {
      return state.staticMenuList;
    },
    getLastBuildMenuTime(state): number {
      return state.lastBuildMenuTime;
    },
    getIsDynamicAddedRoute(state): boolean {
      return state.isDynamicAddedRoute;
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
      list?.length > 0 && this.setLastBuildMenuTime();
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list;
    },

    setStaticMenuList(list: Menu[]) {
      this.staticMenuList = list;
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime();
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },
    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.lastBuildMenuTime = 0;
    },
    async changePermissionCode() {
      const codeList = await getPermCode();
      this.setPermCodeList(codeList);
    },

    // 构建路由
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n();
      const userStore = useUserStore();
      const appStore = useAppStoreWithOut();

      let routes: AppRouteRecordRaw[] = [];
      // 角色列表  拿到角色角色下可以关联哪些菜单
      const roleList = toRaw(userStore.getRoleList) || [];
      // 权限模式
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;

      // 路由过滤器 在 函数filter 作为回调传入遍历使用
      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // 抽出角色
        const { roles } = meta || {};
        if (!roles) return true;
        // 进行角色权限判断
        return roleList.some((role) => roles.includes(role));
      };

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // ignoreRoute 为true 则路由仅用于菜单生成，不会在实际的路由表中出现
        const { ignoreRoute } = meta || {};
        // arr.filter 返回 true 表示该元素通过测试
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return;
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME;

        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/';
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true });
                throw new Error('end');
              }
            }
            children && children.length > 0 && patcher(children, currentPath);
          });
        }

        try {
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return;
      };

      // 启动自定义后端路由的时候 为所有路由分配组件，即使有 redirect 也需要组件
      const wrapperRouteComponent = (routes: AppRouteRecordRaw[]) => {
        return routes.map((route) => {
          // 为所有路由分配组件，即使有 redirect 也需要组件
          // 对于有 redirect 的路由，组件不会被渲染，但 Vue Router 要求必须存在
          const component = ROUTE_MAP[route.name as string];
          // console.log('为路由', route.name, '分配组件:', component);

          route.component = component;

          // 如果有子路由，进行递归遍历
          if (route.children && route.children.length > 0) {
            route.children = wrapperRouteComponent(route.children);
          }
          return route;
        });
      };

      // 将后端返回的路由转化成前端结构
      const conventMenuTree = (menuList: any) => {
        const menus: any[] = [];
        menuList.forEach((menu) => {
          // 解析meta字段
          if (menu.meta && typeof menu.meta === 'string') {
            try {
              menu.meta = JSON.parse(menu.meta);
            } catch {
              createMessage.error('JSON解析错误:', menu.meta);
            }
          }
          // 如果是父路由
          if (menu.pid === 0) {
            menus.push(menu);
            // 让父路由先将子路由数组创建起来
            if (!menu.children) {
              menu.children = [];
            }
          } else {
            // 如果是子路由 将父路由找出
            const parentMenu = menuList.find((parentMenuItem) => parentMenuItem.id === menu.pid);
            if (parentMenu) {
              // 确保parentMenu.children存在
              if (!parentMenu.children) {
                parentMenu.children = [];
              }
              // 将子路由添加到父路由的children数组中
              parentMenu.children.push(menu);
            }
          }
        });
        return menus;
      };

      // 获取到后端的路由 且改造为前端结构
      const getAllMenu = async () => {
        try {
          const response = await getAllMenuList();

          // 处理API返回的数据结构：PromiseResult包含menuList数组
          if (response && Array.isArray(response)) {
            const menuData = conventMenuTree(response);
            return menuData;
          } else {
            createMessage.error('API返回数据格式不正确，menuList不存在或不是数组');
            return [];
          }
        } catch {
          createMessage.error('getAllMenu API调用失败');
          return [];
        }
      };

      let backendRoutes: object[] = [];

      try {
        backendRoutes = [];
        const apiResult = await getAllMenu();
        // 如果后端返回了有效的路由数据，直接使用后端数据，不需要转换
        if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
          backendRoutes = apiResult;
        } else {
          createMessage.warning('后端返回数据无效，使用备用路由');
        }
      } catch {
        createMessage.error('后端菜单API调用失败，使用备用路由');
      }

      // 如果要看框架原来的页面就开启这个 asyncRoutes
      // import { asyncRoutes } from '@/router/routes';
      // backendRoutes = asyncRoutes;

      switch (permissionMode) {
        // 角色权限
        case PermissionModeEnum.ROLE:
          const staticMenuList = transformMenuModules(menuModules);
          staticMenuList.sort((a, b) => {
            return (a.orderNo || 0) - (b.orderNo || 0);
          });
          // 设置菜单列表
          this.setStaticMenuList(staticMenuList);
          // 对非一级路由进行过滤
          routes = filter(wrapperRouteComponent(backendRoutes as AppRouteRecordRaw[]), routeFilter);
          // routes = filter(backendRoutes as AppRouteRecordRaw[], routeFilter);
          // 对一级路由根据角色权限过滤
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        // 路由映射， 默认进入该case
        case PermissionModeEnum.ROUTE_MAPPING:
          // 对非一级路由进行过滤
          routes = filter(wrapperRouteComponent(backendRoutes as AppRouteRecordRaw[]), routeFilter);
          // routes = filter(backendRoutes as AppRouteRecordRaw[], routeFilter);
          // 对一级路由再次根据角色权限过滤
          routes = routes.filter(routeFilter);
          // 将路由转换成菜单
          const menuList = transformRouteToMenu(routes, true);
          // 移除掉 ignoreRoute: true 的路由 非一级路由
          routes = filter(routes, routeRemoveIgnoreFilter);
          // 移除掉 ignoreRoute: true 的路由 一级路由；
          routes = routes.filter(routeRemoveIgnoreFilter);
          // 对菜单进行排序
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          // 设置菜单列表
          this.setFrontMenuList(menuList);

          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        //  如果确定不需要做后台动态权限，请在下方注释整个判断
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage();

          createMessage.loading({
            content: t('sys.app.menuLoading'),
            duration: 1,
          });

          // !Simulate to obtain permission codes from the background,
          // 模拟从后台获取权限码，
          // this function may only need to be executed once, and the actual project can be put at the right time by itself
          // 这个功能可能只需要执行一次，实际项目可以自己放在合适的时间
          let routeList: AppRouteRecordRaw[] = [];
          try {
            await this.changePermissionCode();
            routeList = (await getMenuList()) as AppRouteRecordRaw[];
          } catch (error) {
            console.error(error);
          }

          // Dynamically introduce components
          // 动态引入组件
          routeList = transformObjToRoute(routeList);

          //  Background routing to menu structure
          //  后台路由到菜单结构
          const backMenuList = transformRouteToMenu(routeList);
          this.setBackMenuList(backMenuList);

          // remove meta.ignoreRoute item
          // 删除 meta.ignoreRoute 项
          routeList = filter(routeList, routeRemoveIgnoreFilter);
          routeList = routeList.filter(routeRemoveIgnoreFilter);

          routeList = flatMultiLevelRoutes(routeList);
          routes = [PAGE_NOT_FOUND_ROUTE, ...routeList];
          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);
      return routes;
    },
  },
});

// Need to be used outside the setup
// 需要在设置之外使用
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
