import {
  AccountParams,
  DeptListItem,
  MenuParams,
  RoleParams,
  RolePageParams,
  MenuListGetResultModel,
  DeptListGetResultModel,
  RolePageListGetResultModel,
  RoleListGetResultModel,
  AreaListItem,
} from './model/systemModel';
import { defHttp } from '@/utils/http/axios';

enum Api {
  Account = '/user',
  AreaList = '/user/area',
  MenuList = '/menu',
  RoleList = '/role',
  IsAccountExist = '/user/accountExist',
  AssignRole = '/role/assign',
  GetRoleMenuList = '/role/getRoleMenus',
  DeptList = '/system/getDeptList',
  setRoleStatus = '/system/setRoleStatus',
  RolePageList = '/system/getRoleListByPage',
  GetAllRoleList = '/system/getAllRoleList',
}

export const getMerchantAccountList = (params: AccountParams) => {
  // 转换分页参数：将pageSize转换为limit
  const { pageSize, ...otherParams } = params;
  const transformedParams = {
    ...otherParams,
    ...(pageSize !== undefined && { limit: pageSize }),
  };

  return defHttp.get<any>({
    url: Api.Account,
    params: transformedParams,
  });
};

export const getArea = (params?: AreaListItem) => defHttp.get<any>({ url: Api.AreaList, params });

export const getMenuList = (params?: MenuParams) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.MenuList, params });

export const getRoleList = (params?: RoleParams) =>
  defHttp.get<RoleListGetResultModel>({ url: Api.RoleList, params });

export const createAccount = (data: any) => defHttp.post({ url: Api.Account, data });

export const isAccountExist = (username: string) =>
  defHttp.post({ url: Api.IsAccountExist, data: { username } }, { errorMessageMode: 'none' });

export const deleteAccount = (id: number) => defHttp.delete({ url: `${Api.Account}/${id}` });

export const createRole = (data: any) => defHttp.post({ url: Api.RoleList, data });

export const updateRole = (data: any) => defHttp.put({ url: Api.RoleList, data });

export const assignMenu = (data: any) => defHttp.post({ url: Api.AssignRole, data });

export const getRoleMenuList = (roleId: number) =>
  defHttp.get<any>({ url: `${Api.GetRoleMenuList}/${roleId}` });

export const getRoleListByPage = (params?: RolePageParams) =>
  defHttp.get<RolePageListGetResultModel>({ url: Api.RolePageList, params });

export const getAllRoleList = (params?: RoleParams) =>
  defHttp.get<RoleListGetResultModel>({ url: Api.GetAllRoleList, params });

export const setRoleStatus = (id: number, status: string) =>
  defHttp.post({ url: Api.setRoleStatus, params: { id, status } });

export const getDeptList = (params?: DeptListItem) =>
  defHttp.get<DeptListGetResultModel>({ url: Api.DeptList, params });
