import { defHttp } from '@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';

enum Api {
  GetMenuList = '/getMenuList',
  GetAllMenuList = '/menu',
}

/**
 * @description: Get user menu based on id
 */

export const getMenuList = () => {
  return defHttp.get<getMenuListResultModel>({ url: Api.GetMenuList });
};

export const getAllMenuList = () => {
  return defHttp.get({ url: Api.GetAllMenuList });
};
