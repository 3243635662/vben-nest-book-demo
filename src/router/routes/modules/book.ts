import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const book: AppRouteModule = {
  path: '/book',
  name: 'Book',
  component: LAYOUT,
  redirect: '/book/list',
  meta: {
    orderNo: 11,
    icon: 'ion:book-outline',
    title: t('routes.book.book'),
  },
  children: [
    {
      path: 'list',
      name: 'BookList',
      component: () => import('@/views/book/list/index.vue'),
      meta: {
        // affix: true,
        title: t('routes.book.list'),
      },
    },
    {
      path: 'create',
      name: 'BookCreate',
      component: () => import('@/views/book/create/index.vue'),
      meta: {
        title: t('routes.book.create'),
      },
    },
  ],
};

export default book;
