<template>
  <div class="w-150 m-auto">
    <Result status="success" title="图书创建成功" sub-title="您的图书已成功创建">
      <template #extra>
        <a-button type="primary" @click="emit('redo')"> 创建新图书 </a-button>
        <a-button @click="emit('view')"> 查看图书 </a-button>
      </template>
    </Result>

    <!-- 显示图书基本信息 -->
    <div
      class="max-w-4xl mx-auto mt-8 px-8 py-10 bg-white rounded-xl shadow-sm border border-gray-100"
      v-if="bookInfo"
    >
      <div class="text-center mb-8">
        <h4 class="text-2xl font-semibold text-gray-800 mb-2">图书信息</h4>
        <div class="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
      </div>

      <div class="bg-gray-50 rounded-lg p-6">
        <Descriptions :column="1" class="space-y-4">
          <Descriptions.Item label="书名" class="text-base">
            <span class="font-medium text-gray-900">{{ bookInfo.title }}</span>
          </Descriptions.Item>
          <Descriptions.Item label="作者" class="text-base">
            <span class="text-gray-700">{{ bookInfo.author }}</span>
          </Descriptions.Item>
          <Descriptions.Item label="出版社" class="text-base">
            <span class="text-gray-700">{{ bookInfo.publisher }}</span>
          </Descriptions.Item>
          <Descriptions.Item label="分类" class="text-base">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {{ bookInfo.categoryName || '未分类' }}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="语言" class="text-base">
            <span class="text-gray-600">{{ bookInfo.language || '未知语言' }}</span>
          </Descriptions.Item>
          <Descriptions.Item label="解析目录" class="text-base">
            <div class="bg-white rounded-lg p-4 mt-2 max-h-64 overflow-y-auto">
              <ul class="space-y-2">
                <li
                  v-for="(item, index) in bookInfo.bookMenuList"
                  :key="index"
                  class="flex items-start text-gray-700"
                >
                  <span
                    class="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0"
                  >
                    {{ index + 1 }}
                  </span>
                  <span class="leading-relaxed">{{ item }}</span>
                </li>
              </ul>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>
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
    cover: props.bookInfo?.cover || '',
    file: props.bookInfo?.file || '',
    publisher: props.bookInfo?.publisher || '未知出版社',
    categoryName: props.bookInfo?.categoryName || '',
    language: props.bookInfo?.language || '未知语言',
    bookMenuList: props.bookInfo?.bookMenuList || [],
  }));
</script>
