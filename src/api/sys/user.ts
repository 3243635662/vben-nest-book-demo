import { defHttp } from '@/utils/http/axios';
import { LoginParams, LoginResultModel, GetUserInfoModel, GetIPModel } from './model/userModel';

import { ErrorMessageMode } from '#/axios';

enum Api {
  // 修改api  前后端联调
  Login = '/auth/login',
  Logout = '/logout',
  GetUserInfo = '/user/info',
  GetPermCode = '/getPermCode',
  TestRetry = '/testRetry',
  GetIP = '/ip/public',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}
// 获取当前用户IP地址
export function getIP() {
  return defHttp.get<GetIPModel>({ url: Api.GetIP }, { errorMessageMode: 'none' });
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: Api.GetUserInfo }, { errorMessageMode: 'none' });
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode });
}

export function doLogout() {
  return defHttp.get({ url: Api.Logout });
}

export function testRetry() {
  return defHttp.get(
    { url: Api.TestRetry },
    {
      retryRequest: {
        isOpenRetry: true,
        count: 5,
        waitTime: 1000,
      },
    },
  );
}
