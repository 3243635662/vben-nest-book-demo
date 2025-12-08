<template>
  <div class="reading-container">
    <!-- 添加统一父容器 -->
    <PageWrapper title="图书阅读" :contentBackground="false">
      <template #headerContent>
        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <Button type="primary" preIcon="ant-design:file-text-filled" @click="fileInput?.click()"
              >打开epub文件
            </Button>
          </div>

          <!-- 章节管理 -->
          <div class="toolbar-center">
            <Button
              type="primary"
              preIcon="meteor-icons:chevron-left"
              @click="epubStore.prevChapter"
              >上一章
            </Button>
            <Button
              type="primary"
              preIcon="meteor-icons:chevron-right"
              @click="epubStore.nextChapter"
              >下一章
            </Button>
          </div>

          <div class="toolbar-right">
            <!-- 字体大小调整 -->
            <div class="toolbar-right-left">
              <Button
                postIcon="fluent:font-decrease-24-filled"
                :iconSize="20"
                @click="decreaseFontSize"
                >-</Button
              >

              <Button :disabled="true">{{ fontSize }}px</Button>

              <Button
                postIcon="fluent:font-increase-24-filled"
                :iconSize="20"
                @click="increaseFontSize"
                >+</Button
              >
            </div>

            <!-- 主题切换 -->
            <div class="toolbar-right-center">
              <Button
                type="primary"
                @click="toggleTheme"
                :preIcon="
                  isDarkTheme
                    ? 'material-symbols-light:moon-stars'
                    : 'material-symbols-light:sunny-outline'
                "
                >{{ isDarkTheme ? '深色' : '浅色' }}</Button
              >
            </div>

            <!-- 抽屉按钮 -->
            <div class="toolbar-right-drawer">
              <Button
                type="primary"
                preIcon="iconoir:drawer"
                @click="
                  !currentBook ? createMessage.warning('请先加载epub文件') : (showDrawer = true)
                "
              >
                目录
              </Button>
            </div>

            <!-- 搜索框 -->
            <div class="toolbar-right-right">
              <BasicForm
                :schemas="toolSearchSchemas"
                v-bind="searchFormProps"
                class="search-form"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 阅读区域 -->
      <div class="reading-area" v-if="currentBook || !currentBook">
        <!-- 加载状态 - 放在阅读区域内 -->
        <Loading
          v-if="isLoading"
          :loading="loadingState.loading"
          :absolute="loadingState.absolute"
          :theme="loadingState.theme"
          :background="loadingState.background"
          :tip="loadingState.tip"
        />

        <!-- 内容显示区域 -->
        <div v-if="currentBook && !isLoading" class="reading-content-wrapper">
          <div class="reading-header">
            <Alert :message="currentChapter.title" type="info" />
          </div>
          <div class="reading-content">
            <div
              class="chapter-content"
              :style="{ fontSize: fontSize + 'px' }"
              v-html="currentChapter.htmlContent"
            >
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!currentBook && !isLoading" class="reading-area-empty">
          <div class="empty-content">
            <Icon icon="si:book-fill" :size="200" />
            <p class="welcome-text">欢迎使用图书阅读器</p>
          </div>
        </div>
      </div>
    </PageWrapper>

    <!-- 隐藏的 -->
    <input
      type="file"
      accept=".epub"
      ref="fileInput"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 目录抽屉 -->
    <BasicDrawer :open="showDrawer" @open-change="showDrawer = $event" width="450" placement="left">
      <template #title>
        <div class="drawer-title">
          <span>{{ currentBook?.title || '图书目录' }}</span>
        </div>
      </template>

      <Tabs v-model:activeKey="activeTab" type="card" class="simple-tabs">
        <TabPane key="menu" tab="目录">
          <div class="chapter-list">
            <div
              v-for="(chapter, index) in chapters"
              :key="chapter.id"
              class="chapter-item"
              :class="{ 'chapter-active': currentChapterIndex === index }"
              @click="currentChapterIndex = index"
            >
              <span class="chapter-index">{{ index + 1 }}</span>
              <span class="chapter-title">{{ chapter.title }}</span>
            </div>
          </div>
        </TabPane>
        <TabPane key="statistic" tab="统计">阅读进度和数据分析</TabPane>
        <TabPane key="voice" tab="语音">语音播放控制选项</TabPane>
      </Tabs>
    </BasicDrawer>
  </div>
</template>

<script setup lang="ts">
  // 导入
  import { Loading } from '@/components/Loading';
  import { Alert } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useEpubStore } from '@/store/modules/epub';
  import { Tabs } from 'ant-design-vue';
  import { BasicDrawer } from '@/components/Drawer';
  import { BasicForm } from '@/components/Form';
  import { toolSearchSchemas, searchFormProps } from './data';
  import { PageWrapper } from '@/components/Page';
  import { Button } from '@/components/Button';
  import { ref, computed, reactive, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSettingStore } from '@/store/modules/settingStore';
  import { useMessage } from '../../../hooks/web/useMessage';

  // 变量
  const { createMessage } = useMessage();
  const settingsStore = useSettingStore();
  const epubStore = useEpubStore();
  const fileInput = ref<HTMLInputElement | null>(null);
  const { theme, fontSize } = storeToRefs(settingsStore);
  const { isLoading, chapters, currentBook, currentChapterIndex, currentChapter } =
    storeToRefs(epubStore);
  const isDarkTheme = computed(() => theme.value === 'dark');
  const showDrawer = ref(false);
  const TabPane = Tabs.TabPane;
  const activeTab = ref('menu');
  const loadingState = reactive<{
    absolute?: boolean;
    loading?: boolean;
    theme?: 'dark' | 'light';
    background?: string;
    tip?: string;
  }>({
    absolute: true, // 使用绝对定位，相对于 reading-area
    loading: false,
    theme: isDarkTheme.value ? 'dark' : 'light',
    background: 'rgba(255,255,255,0.8)', // 调整为更亮的背景
    tip: '正在加载图书...',
  });

  // 监听
  watch(
    [isLoading, isDarkTheme],
    ([newIsLoading, newIsDarkTheme]) => {
      loadingState.loading = newIsLoading;
      loadingState.theme = newIsDarkTheme ? 'dark' : 'light';
    },
    { immediate: true },
  );
  // 方法

  // 文件选择处理
  const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    try {
      if (file) {
        epubStore.loadEpubFile(file);
        createMessage.success('文件选择成功');
      }
    } catch (error) {
      createMessage.error(`文件选择失败: ${error.message}`);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    settingsStore.theme = isDarkTheme.value ? 'light' : 'dark';
  };

  // 减少字体大小
  const decreaseFontSize = () => {
    settingsStore.decreaseFontSize();
  };

  // 增加字体大小
  const increaseFontSize = () => {
    settingsStore.increaseFontSize();
  };
</script>

<style scoped lang="less">
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .toolbar-left,
    .toolbar-center,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .toolbar-right {
      gap: 50px;

      .toolbar-right-left,
      .toolbar-right-center,
      .toolbar-right-right {
        display: flex;
        align-items: center;
      }
    }
  }

  .chapter-list {
    margin-top: 16px;
    overflow: hidden;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);

    .chapter-item {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      transition: all 0.3s ease;
      border-bottom: 1px solid #f9fafb;
      cursor: pointer;
      gap: 12px;

      // 移除最后一个元素的分隔线
      &:last-child {
        border-bottom: none;
      }

      &:hover {
        transform: translateX(2px);
        background-color: #f8fafc;
      }

      // 激活状态样式
      &.chapter-active {
        background-color: #e0f2fe;

        .chapter-index {
          background-color: #0ea5e9;
          color: #fff;
        }

        .chapter-title {
          color: #0c4a6e;
          font-weight: 700;
        }
      }

      .chapter-index {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        transition: all 0.2s ease;
        border-radius: 8px;
        background-color: #f1f5f9;
        color: #64748b;
        font-size: 14px;
        font-weight: 500;
      }

      .chapter-title {
        flex: 1;
        overflow: hidden;
        transition: color 0.2s ease;
        color: #374151;
        font-size: 15px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .reading-area {
    display: flex;
    position: relative;
    flex: 1;
    flex-direction: column;
    min-height: 400px; /* 确保有最小高度，让 Loading 有显示空间 */
    overflow: hidden;

    .reading-content-wrapper {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }

    .reading-header {
      flex-shrink: 0;
      padding: 16px;
      font-weight: 600;
    }

    .reading-content {
      flex: 1;
      padding: 0;
      overflow-y: auto;

      .chapter-content {
        padding: 24px;
        font-family: 'Noto Serif SC', serif;
        line-height: 1.5;
      }
    }
  }

  .reading-area-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #0960bd;
      gap: 24px;
    }

    .welcome-text {
      margin: 0;
      color: #9ca3af;
      font-size: 18px;
      font-weight: 500;
    }
  }
  // 修复搜索框对齐问题
  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  // 简约Tabs样式
  .simple-tabs {
    :deep(.ant-tabs-nav) {
      margin-bottom: 16px;

      &::before {
        border-bottom: 1px solid #f0f0f0;
      }
    }

    :deep(.ant-tabs-tab) {
      margin-right: 4px;
      transition: all 0.2s ease;
      border: none;
      border-radius: 6px 6px 0 0;
      background: transparent;

      &:hover {
        background-color: #f9fafb;
        color: #374151;
      }
    }

    :deep(.ant-tabs-tab-active) {
      background-color: #fff;
      color: #1f2937;
      font-weight: 600;

      &:hover {
        background-color: #fff;
      }
    }

    :deep(.ant-tabs-content) {
      padding: 16px 0;
      line-height: 1.5;
    }
  }

  // 深色主题简约样式
  :deep(.dark) .simple-tabs {
    :deep(.ant-tabs-tab) {
      color: #d1d5db;

      &:hover {
        background-color: #374151;
        color: #f3f4f6;
      }
    }

    :deep(.ant-tabs-tab-active) {
      background-color: #1f2937;
      color: #f9fafb;

      &:hover {
        background-color: #1f2937;
      }
    }

    :deep(.ant-tabs-content) {
      color: #9ca3af;
    }

    :deep(.ant-tabs-nav::before) {
      border-color: #374151;
    }
  }

  // 深色主题下的章节列表样式
  :deep(.dark) .chapter-list {
    border-color: #374151; // 深色边框
    background: #1f2937; // 深色背景

    .chapter-item {
      border-bottom-color: #374151; // 深色分隔线

      &:hover {
        background-color: #374151; // 深色悬停背景
      }

      &.chapter-active {
        border-left-color: #38bdf8; // 更亮的蓝色边框
        background-color: #0f172a; // 深色激活背景

        .chapter-index {
          background-color: #38bdf8; // 亮蓝色序号背景
        }

        .chapter-title {
          color: #f0f9ff; // 浅色标题文字
        }
      }

      .chapter-index {
        background-color: #374151; // 深色序号背景
        color: #9ca3af; // 浅色序号文字
      }

      .chapter-title {
        color: #e5e7eb; // 浅色标题文字
      }
    }
  }

  // 现代抽屉标题样式
  .drawer-title {
    padding: 8px 0;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;

    :deep(.dark) & {
      color: #f9fafb; // 深色主题下的标题颜色
    }
  }
</style>
