<template>
  <div class="w-150 m-auto">
    <Result status="success" title="图书创建成功" sub-title="您的图书已成功创建">
      <template #extra>
        <a-button type="primary" @click="emit('redo')"> 创建新图书 </a-button>
        <a-button @click="emit('view')"> 查看图书 </a-button>
      </template>
    </Result>
    
    <!-- 显示图书基本信息 -->
    <div class="mt-6 px-6 py-8 bg-white" v-if="bookInfo">
      <h4 class="text-lg font-medium mb-4">图书信息</h4>
      <Descriptions :column="1" class="mt-5">
        <Descriptions.Item label="书名"> {{ bookInfo.title }} </Descriptions.Item>
        <Descriptions.Item label="作者"> {{ bookInfo.author }} </Descriptions.Item>
        <Descriptions.Item label="出版社"> {{ bookInfo.publisher }} </Descriptions.Item>
        <Descriptions.Item label="分类"> {{ bookInfo.categoryName || '未分类' }} </Descriptions.Item>
      </Descriptions>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Result, Descriptions } from 'ant-design-vue';
  import { computed } from 'vue';

  const props = defineProps({
    bookInfo: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['redo', 'view']);

  // 计算属性确保有默认值
  const bookInfo = computed(() => ({
    title: props.bookInfo?.title || '未知书名',
    author: props.bookInfo?.author || '匿名',
    publisher: props.bookInfo?.publisher || '未知出版社',
    categoryName: props.bookInfo?.categoryName || '',
  }));
</script>
