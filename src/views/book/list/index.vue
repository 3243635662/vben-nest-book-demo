<template>
  <PageWrapper :class="prefixCls" title="图书列表">
    <template #headerContent>
      <BasicForm
        :class="`${prefixCls}__header-form`"
        :labelWidth="100"
        :schemas="schemas"
        :showActionButtonGroup="true"
        @submit="handleSearch"
        v-model="PaginateParams.keyword"
        @reset="handleReset"
      />
    </template>
    <div :class="`${prefixCls}__container`">
      <List>
        <template v-for="item in bookList" :key="item.id">
          <List.Item>
            <template #extra>
              <img
                :class="`${prefixCls}__cover`"
                alt="logo"
                :src="
                  item.cover ||
                  'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png'
                "
              />
            </template>
            <List.Item.Meta>
              <template #description>
                <div :class="`${prefixCls}__content`">
                  <div>作者：{{ item.author || '暂无作者' }}</div>
                  <div>出版社：{{ item.publisher || '暂无出版社' }}</div>
                </div>
                <div :class="`${prefixCls}__action`" class="flex items-center">
                  <a-button
                    type="primary"
                    size="small"
                    @click="handleEdit(item.id)"
                    class="mr-2"
                    preIcon="mdi:page-next-outline"
                  >
                    编辑
                  </a-button>
                  <a-button
                    type="primary"
                    size="small"
                    @click="handleDelete(item.id)"
                    danger
                    preIcon="mdi:page-next-outline"
                    class="mr-2"
                  >
                    删除
                  </a-button>
                  <a-button
                    size="small"
                    @click="handleRead(item.id)"
                    color="success"
                    preIcon="mdi:page-next-outline"
                  >
                    看书
                  </a-button>
                  <span :class="`${prefixCls}__time`">{{
                    formatTime(item.created_at || item.createTime)
                  }}</span>
                </div>
              </template>
              <template #title>
                <p :class="`${prefixCls}__title`">
                  {{ item.title }}
                </p>
                <div>
                  <template v-for="tag in item.categoryName.split(',') || []" :key="tag">
                    <Tag class="mb-2">
                      {{ tag }}
                    </Tag>
                  </template>
                </div>
              </template>
            </List.Item.Meta>
          </List.Item>
        </template>
      </List>
      <Pagination
        v-model:current="PaginateParams.page"
        v-model:pageSize="PaginateParams.limit"
        :total="totalBook"
        :pageSizeOptions="[5, 10, 20]"
        show-size-changer
        show-quick-jumper
        @change="handlePageChange"
      />
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { Tag, List, Pagination } from 'ant-design-vue';
  import { BasicForm } from '@/components/Form';
  import { bookList, schemas, initBookList, totalBook, PaginateParams } from './data';
  import { PageWrapper } from '@/components/Page';
  import { onMounted } from 'vue';
  import { formatToDateTime } from '@/utils/dateUtil';
  const prefixCls = 'list-search';
  import { deleteBook } from '@/api/sys/book';
  import { useMessage } from '@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  // 初始化数据
  onMounted(async () => {
    await initBookList({
      ...PaginateParams.value,
    });
  });

  // 格式化时间函数
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return formatToDateTime(timeStr);
  };

  // 搜索处理函数
  const handleSearch = async (values: any) => {
    let keyword = values?.keyword || '';
    // 更新分页参数
    PaginateParams.value = {
      ...PaginateParams.value,
      page: 1,
      keyword: keyword,
    };
    // 重置到第一页并搜索
    await initBookList({
      ...PaginateParams.value,
    });
  };

  // 分页变化处理
  const handlePageChange = async (newPage: number) => {
    PaginateParams.value = {
      ...PaginateParams.value,
      page: newPage,
    };

    // 重新获取数据，替换当前页面数据
    await initBookList({
      ...PaginateParams.value,
    });
  };
  // 清除校验
  const handleReset = () => {
    // 重置分页参数
    PaginateParams.value = {
      ...PaginateParams.value,
      page: 1,
      keyword: '',
    };
    initBookList({
      ...PaginateParams.value,
    });
  };

  // 编辑按钮点击事件
  const handleEdit = (bookId: number) => {
    console.log('编辑图书:', bookId);
  };

  // 删除按钮点击事件
  const handleDelete = async (bookId: number) => {
    try {
      const res = await deleteBook(bookId);
      if (res) {
        createMessage.success('删除成功');
        await initBookList({
          ...PaginateParams.value,
        });
      } else {
        createMessage.error('删除失败');
      }
    } catch (error) {
      createMessage.error('删除失败');
    }
  };

  // 看书按钮点击事件
  const handleRead = (bookId: number) => {
    console.log('查看图书:', bookId);
  };
</script>
<style lang="less" scoped>
  .list-search {
    &__cover {
      flex-shrink: 0;
      width: 140px;
      height: 180px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
      object-fit: cover;
    }

    // 确保List项布局合理
    :deep(.ant-list-item) {
      display: flex;
      align-items: flex-start;
      padding: 16px 0;
    }

    :deep(.ant-list-item-meta) {
      flex: 1;
      margin-right: 16px;
    }

    :deep(.ant-list-item-extra) {
      flex-shrink: 0;
      margin-left: 16px;
    }

    &__header {
      &-form {
        margin-bottom: -16px;
      }
    }

    &__container {
      padding: 12px;
      background-color: @component-background;
    }

    &__title {
      margin-bottom: 12px;
      color: @text-color;
      font-size: 18px;
      font-weight: 500;
    }

    &__content {
      margin-bottom: 12px;
      color: @text-color-secondary;

      div {
        margin-bottom: 4px;
      }
    }

    &__action {
      display: flex;
      position: relative;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 10px;

      :deep(.ant-btn) {
        margin-bottom: 8px;
      }
    }

    &__time {
      position: relative;
      top: auto;
      right: auto;
      margin-left: auto;
      color: rgb(0 0 0 / 45%);
    }
  }
</style>
