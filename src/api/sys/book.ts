import { defHttp } from '@/utils/http/axios';

enum Api {
  Book = '/book',
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

// 删除图书
export const deleteBook = (id: number) => {
  return defHttp.delete({
    url: `${Api.Book}/${id}`,
  });
};
