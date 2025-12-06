import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
// import chaptersData from '@/views/book/data/chapters.json';

interface Chapter {
  id: number;
  title: string;
  content: string;
}

export const useEpubStore = defineStore('epub', () => {
  // 状态：

  const isLoading = ref(false);
  // 章节信息列表
  const chapters = ref<Chapter[]>([]);
  // const chapters = ref(chaptersData.chapters); // 假数据

  const currentBook = ref<any>(null);

  // 当前章节索引
  const currentChapterIndex = ref(0);

  // 计算属性：

  const currentChapter = computed(() => {
    return chapters.value[currentChapterIndex.value] || null;
  });

  // 方法
  const loadEpubFile = (file: File) => {
    isLoading.value = true;
    console.log(file);
    setTimeout(() => {
      isLoading.value = false;
    }, 3000);
  };
  return { isLoading, chapters, currentBook, currentChapterIndex, currentChapter, loadEpubFile };
});
