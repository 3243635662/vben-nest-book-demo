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
                <div :class="`${prefixCls}__action`">
                  <template v-for="action in actions" :key="action.icon">
                    <div :class="`${prefixCls}__action-item`">
                      <Icon
                        v-if="action.icon"
                        :class="`${prefixCls}__action-icon`"
                        :icon="action.icon"
                        :color="action.color"
                      />
                      {{ action.text }}
                    </div>
                  </template>
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
  import Icon from '@/components/Icon/Icon.vue';
  import { BasicForm } from '@/components/Form';
  import { actions, bookList, schemas, initBookList, totalBook, PaginateParams } from './data';
  import { PageWrapper } from '@/components/Page';
  import { onMounted } from 'vue';
  import { formatToDateTime } from '@/utils/dateUtil';
  const prefixCls = 'list-search';

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
      position: relative;
      margin-top: 10px;

      &-item {
        display: inline-block;
        padding: 0 16px;
        color: @text-color-secondary;

        &:nth-child(1) {
          padding-left: 0;
        }

        &:nth-child(1),
        &:nth-child(2) {
          border-right: 1px solid @border-color-base;
        }
      }

      &-icon {
        margin-right: 3px;
      }
    }

    &__time {
      position: absolute;
      top: 0;
      right: 0;
      color: rgb(0 0 0 / 45%);
    }
  }
</style>
