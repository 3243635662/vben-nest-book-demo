import { FormSchema } from '@/components/Form';
import { getBookList, GetBookListParams } from '@/api/sys/book';
import { ref } from 'vue';
import { useMessage } from '../../../hooks/web/useMessage';

const { createMessage } = useMessage();
// 使用响应式数据
export const PaginateParams = ref({
  page: 1,
  keyword: '',
  limit: 5,
  sort: '',
  order: 'DESC',
});
export const bookList = ref<any[]>([]);
export const totalBook = ref(0);
// 初始化数据
export const initBookList = async (params: GetBookListParams = {}) => {
  try {
    // 使用传入的参数或默认的分页参数
    const finalParams = Object.keys(params).length > 0 ? params : PaginateParams.value;

    const res = await getBookList(finalParams);

    // 替换当前数据而不是追加
    bookList.value = res.items || res || [];
    totalBook.value = res.meta?.totalItems || 0;
    return bookList.value;
  } catch (error) {
    createMessage.error('获取图书列表失败');
    bookList.value = [];
    totalBook.value = 0;
    return [];
  }
};
// 分页数据处理函数 - 用于加载指定页的数据
export const loadPageData = async (pageNum: number) => {
  try {
    const res = await getBookList({
      ...PaginateParams.value,
      page: pageNum,
    });
    // 替换当前页面数据
    bookList.value = res.items || res || [];
    totalBook.value = res.meta?.totalItems || 0;
    return bookList.value;
  } catch (error) {
    createMessage.error('获取图书列表失败');
    return [];
  }
};
export const actions: any[] = [
  { icon: 'clarity:star-line', text: '156', color: '#018ffb' },
  { icon: 'bx:bxs-like', text: '156', color: '#459ae8' },
  { icon: 'bx:bxs-message-dots', text: '2', color: '#42d27d' },
];

export const schemas: FormSchema[] = [
  {
    field: 'keyword',
    component: 'Input',
    label: '关键词',
    colProps: {
      span: 8,
    },
    componentProps: {
      placeholder: '请输入你要查找的关键词',
    },
  },
];
