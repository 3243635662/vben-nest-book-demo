import { defHttp } from '@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';

enum Api {
  GetEnableMenuList = '/menu/enable',
  RestfulMenu = '/menu',
}

/**
 * @description: Get user menu based on id
 */

// 这里做一个区分介绍：这里分一个使用路由和 menu显示路由的概念 前者是作为真实界面展示使用，一个和是在路由管理页展示使用 也就是说在管理页能控制使用路由的启用和关闭Referer白名单格式错误

// 这里的getMenuList 是获取当前用户的菜单列表 而
export const getMenuList = () => {
  return defHttp.get<getMenuListResultModel>({ url: Api.GetEnableMenuList });
};

// 这里的 getAllMenuList 是获取所有菜单列表 包括被禁用的
export const getAllMenuList = () => {
  return defHttp.get({ url: Api.RestfulMenu });
};

export const createMenu = (data: any) => {
  return defHttp.post({ url: Api.RestfulMenu, data });
};

export const updateMenu = (data: any) => {
  return defHttp.put({ url: Api.RestfulMenu, data });
};
