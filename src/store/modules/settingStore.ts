import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingStore = defineStore('setting', () => {
  // 主题
  const theme = ref('light');

  // 字体大小
  const fontSize = ref(18);

  // 方法
  const decreaseFontSize = () => {
    fontSize.value -= 2;
  };

  // 增加字体大小
  const increaseFontSize = () => {
    fontSize.value += 2;
  };

  return { theme, fontSize, decreaseFontSize, increaseFontSize };
});
