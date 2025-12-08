import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { parseEpub } from '../../utils/book/epubParser';
import { indexedDBHelper } from '../../utils/book/indexedDBHelper';

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
    // 状态
    const isLoading = ref(false);
    const chapters = ref<Chapter[]>([]);
    const currentBook = ref<any>(null);
    const currentChapterIndex = ref(0);
    const currentChapterContent = ref('');

    // localStorage 只存储轻量级数据
    const currentBookId = ref<string>('');

    // 计算属性
    const currentChapter = computed(() => {
      return chapters.value[currentChapterIndex.value] || null;
    });

    // 生成图书ID
    const generateBookId = (file: File) => {
      return `book_${file.name}_${file.size}_${file.lastModified}`;
    };

    // 从 IndexedDB 加载图书
    const loadFromIndexedDB = async (bookId: string) => {
      try {
        const bookData = await indexedDBHelper.getBook(bookId);
        if (bookData) {
          currentBook.value = bookData.metadata;
          chapters.value = bookData.chapters;
          currentChapterIndex.value = bookData.currentChapterIndex;
          currentBookId.value = bookId;

          // 加载当前章节
          if (chapters.value.length > 0) {
            await loadChapterContent(currentChapterIndex.value);
          }

          return true;
        }
        return false;
      } catch (error) {
        console.error('从IndexedDB加载失败:', error);
        return false;
      }
    };

    // 保存到 IndexedDB
    const saveToIndexedDB = async () => {
      if (!currentBook.value || !currentBookId.value) return;

      try {
        await indexedDBHelper.saveBook({
          id: currentBookId.value,
          title: currentBook.value.title || '未知图书',
          author: currentBook.value.author || '未知作者',
          chapters: chapters.value,
          metadata: currentBook.value,
          currentChapterIndex: currentChapterIndex.value,
          lastRead: Date.now(),
        });
      } catch (error) {
        console.error('保存到IndexedDB失败:', error);
      }
    };

    // 加载 EPUB 文件
    const loadEpubFile = async (file: File) => {
      isLoading.value = true;
      const bookId = generateBookId(file);

      try {
        // 先检查是否已缓存
        const cached = await loadFromIndexedDB(bookId);
        if (cached) {
          console.log('从缓存加载图书');
          isLoading.value = false;
          return;
        }

        // 解析新文件
        const bookData = await parseEpub(file);
        currentBook.value = bookData;
        chapters.value = bookData.chapters || [];
        currentChapterIndex.value = 0;
        currentBookId.value = bookId;

        // 保存到 IndexedDB
        await saveToIndexedDB();

        // 加载第一章
        if (chapters.value.length > 0) {
          await loadChapterContent(0);
        }
      } catch (error) {
        console.error('加载epub文件失败', error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    // 加载章节内容
    const loadChapterContent = async (chapterIndex: number) => {
      if (chapterIndex < 0 || chapterIndex >= chapters.value.length) {
        return;
      }

      try {
        const chapter = chapters.value[chapterIndex];
        currentChapterContent.value = chapter.content || '';
        currentChapterIndex.value = chapterIndex;

        // 更新阅读进度
        await saveToIndexedDB();
      } catch (error) {
        console.error('加载章节内容失败', error);
      }
    };

    // 下一章
    const nextChapter = async () => {
      if (currentChapterIndex.value < chapters.value.length - 1) {
        await loadChapterContent(currentChapterIndex.value + 1);
      }
    };

    // 上一章
    const prevChapter = async () => {
      if (currentChapterIndex.value > 0) {
        await loadChapterContent(currentChapterIndex.value - 1);
      }
    };

    // 清除当前图书
    const clearBook = async () => {
      if (currentBookId.value) {
        await indexedDBHelper.deleteBook(currentBookId.value);
      }
      chapters.value = [];
      currentBook.value = null;
      currentChapterIndex.value = 0;
      currentChapterContent.value = '';
      currentBookId.value = '';
    };

    // 获取所有已缓存的图书
    const getCachedBooks = async () => {
      try {
        return await indexedDBHelper.getAllBooks();
      } catch (error) {
        console.error('获取缓存图书列表失败:', error);
        return [];
      }
    };

    return {
      isLoading,
      chapters,
      currentBook,
      currentChapterIndex,
      currentChapter,
      currentChapterContent,
      currentBookId,
      loadEpubFile,
      loadChapterContent,
      nextChapter,
      prevChapter,
      clearBook,
      loadFromIndexedDB,
      getCachedBooks,
    };
  },
  {
    // localStorage 只存储轻量级的 currentBookId
    persist: {
      key: 'epub-store-light',
      storage: localStorage,
      paths: ['currentBookId'],
    },
  },
);
