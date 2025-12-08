import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { parseEpub } from '../../utils/book/epubParser';

interface Chapter {
  id: number;
  title: string;
  content: string;
  htmlContent?: string;
  href?: string;
  rawHtmlContent?: string;
  order?: number;
}

export const useEpubStore = defineStore(
  'epub',
  () => {
    // 状态：

    const isLoading = ref(false);
    // 章节信息列表
    const chapters = ref<Chapter[]>([]);
    // const chapters = ref(chaptersData.chapters); // 假数据

    const currentBook = ref<any>(null);

    // 当前章节索引
    const currentChapterIndex = ref(0);

    const currentChapterContent = ref('');
    // 计算属性：

    const currentChapter = computed(() => {
      return chapters.value[currentChapterIndex.value] || null;
    });

    // 方法
    const loadEpubFile = async (file: File) => {
      isLoading.value = true;

      try {
        const bookData = await parseEpub(file);
        currentBook.value = bookData;
        chapters.value = bookData.chapters;
        currentChapterIndex.value = 0;

        // 加载第一章的数据
        if (chapters.value.length > 0) {
          await loadChapterContent(0);
        }
      } catch (error) {
        console.error('加载epub文件失败', error);
      }
    };

    // 加载章节
    const loadChapterContent = async (chapterIndex) => {
      if (chapterIndex < 0 || chapterIndex >= chapters.value.length) {
        return;
      }

      isLoading.value = true;

      try {
        const chapter = chapters.value[chapterIndex];
        currentChapterContent.value = chapter.content || '';
        currentChapterIndex.value = chapterIndex;
      } catch (error) {
        console.error('加载章节内容失败', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 章节++
    const nextChapter = () => {
      if (currentChapterIndex.value < chapters.value.length - 1) {
        loadChapterContent(currentChapterIndex.value + 1);
      }
    };
    // 章节--
    const prevChapter = () => {
      if (currentChapterIndex.value > 0) {
        loadChapterContent(currentChapterIndex.value - 1);
      }
    };

    return {
      isLoading,
      chapters,
      currentBook,
      currentChapterIndex,
      currentChapter,
      loadEpubFile,
      nextChapter,
      prevChapter,
    };
  },
  {
    persist: {
      key: 'epub-store',
      storage: localStorage,
      paths: ['currentChapterIndex', 'chapters', 'currentBook'],
    },
  },
);
