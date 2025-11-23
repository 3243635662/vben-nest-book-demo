import { defHttp } from '@/utils/http/axios';

enum Api {
  GetBookList = '/book/list',
}
export interface GetBookListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: string; // 排序的关键词
  order?: string; // 排序的顺序
}
// 获取图书列表

export const getBookList = (params: GetBookListParams) => {
  return defHttp.get({
    url: Api.GetBookList,
    params,
  });
};
