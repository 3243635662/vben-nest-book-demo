<template>
  <div class="w-90 m-auto">
    <Alert message="请确认图书信息，确认后将创建新的图书记录。" show-icon type="info" />
    <Descriptions :column="1" class="mt-5" bordered>
      <Descriptions.Item label="书名"> {{ step1Data.title }} </Descriptions.Item>
      <Descriptions.Item label="封面图片" v-if="step1Data.cover">
        <div v-if="typeof step1Data.cover === 'string'">
          <img
            :src="step1Data.cover"
            alt="封面图片"
            style="max-width: 200px; max-height: 300px; border-radius: 4px"
          />
        </div>
        <div v-else>
          {{ JSON.stringify(step1Data.cover) }}
        </div>
      </Descriptions.Item>
      <Descriptions.Item label="电子书文件" v-if="step1Data.file">
        <div v-if="typeof step1Data.file === 'string'">
          <img
            :src="fileImg"
            alt="文件图标"
            style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle"
          />
          <span>{{ step1Data.file }}</span>
        </div>
        <div v-else>
          {{ JSON.stringify(step1Data.file) }}
        </div>
      </Descriptions.Item>

      <Descriptions.Item label="作者" v-if="step1Data.author && step1Data.author !== '匿名'">
        {{ step1Data.author }}
      </Descriptions.Item>
      <Descriptions.Item
        label="出版社"
        v-if="step1Data.publisher && step1Data.publisher !== '未知出版社'"
      >
        {{ step1Data.publisher }}
      </Descriptions.Item>
      <Descriptions.Item
        label="图书编码"
        v-if="step1Data.bookid && step1Data.bookid !== '未知编码'"
      >
        {{ step1Data.bookid }}
      </Descriptions.Item>
      <Descriptions.Item
        label="分类"
        v-if="step1Data.categoryName && step1Data.categoryName !== '未知分类'"
      >
        {{ step1Data.categoryName }}
      </Descriptions.Item>
      <Descriptions.Item
        label="语言"
        v-if="step1Data.language && step1Data.language !== '未知语言'"
      >
        {{ step1Data.language }}
      </Descriptions.Item>
    </Descriptions>
    <Divider />
    <BasicForm @register="register" />
  </div>
</template>
<script lang="ts" setup>
  import { useMessage } from '@/hooks/web/useMessage';
  import { BasicForm, useForm } from '@/components/Form';
  import { step2Schemas } from './data';
  import { Alert, Divider, Descriptions } from 'ant-design-vue';
  // 导入获取文件图标URL的函数
  import { getFileIconUrl } from '@/components/Upload/src/components/data';
  import { createBookApi, parseEpubApi } from '@/api/sys/upload';
  import { computed } from 'vue';

  const { createMessage } = useMessage();
  // // 安全获取封面数据 - 增加调试信息
  // const coverData = computed(() => {
  //   const cover = props.step1Data?.cover;
  //   console.log('Step2收到的cover数据:', cover, '类型:', typeof cover);

  //   if (!cover) return null;

  //   // 现在直接是URL字符串，无需复杂处理
  //   if (typeof cover === 'string') {
  //     return cover;
  //   }

  //   // 兼容处理：如果是数组，尝试提取URL
  //   if (Array.isArray(cover) && cover.length > 0) {
  //     return cover[0]?.url || cover[0]?.data?.url || cover[0]?.response?.url || '';
  //   }

  //   // 兼容处理：如果是对象，尝试提取URL
  //   if (typeof cover === 'object' && cover !== null) {
  //     return cover.url || cover.data?.url || cover.response?.url || '';
  //   }

  //   return null;
  // });

  // // 安全获取文件数据 - 增加调试信息
  // const fileData = computed(() => {
  //   const file = props.step1Data?.file;
  //   console.log('Step2收到的file数据:', file, '类型:', typeof file);

  //   if (!file) return null;

  //   // 现在直接是URL字符串，无需复杂处理
  //   if (typeof file === 'string') {
  //     return file;
  //   }

  //   // 兼容处理：如果是数组，尝试提取URL
  //   if (Array.isArray(file) && file.length > 0) {
  //     return file[0]?.url || file[0]?.data?.url || file[0]?.response?.url || '';
  //   }

  //   // 兼容处理：如果是对象，尝试提取URL
  //   if (typeof file === 'object' && file !== null) {
  //     return file.url || file.data?.url || file.response?.url || '';
  //   }

  //   return null;
  // });

  // // 安全获取文件图标URL
  // const getSafeFileIconUrl = (file: any): string => {
  //   try {
  //     let fileName = '';

  //     // 如果是字符串（URL），提取文件名
  //     if (typeof file === 'string') {
  //       const urlParts = file.split('/');
  //       fileName = urlParts[urlParts.length - 1] || '';
  //     } else {
  //       // 如果是对象，尝试获取文件名属性
  //       fileName = file?.name || file?.originalName || file?.fileName || '';
  //     }

  //     return getFileIconUrl(fileName); // 返回对应文件类型的图标
  //   } catch (error) {
  //     console.error('获取文件图标时出错:', error);
  //     return getFileIconUrl(''); // 返回默认图标
  //   }
  // };

  // // 安全获取文件名
  // const getSafeFileName = (file: any): string => {
  //   try {
  //     // 如果是字符串（URL），直接返回文件名部分
  //     if (typeof file === 'string') {
  //       const urlParts = file.split('/');
  //       return urlParts[urlParts.length - 1] || '未知文件';
  //     }
  //     // 如果是对象，尝试获取文件名属性
  //     return file?.name || file?.originalName || file?.fileName || '未知文件';
  //   } catch (error) {
  //     console.error('获取文件名时出错:', error);
  //     return '未知文件';
  //   }
  // };

  const props = defineProps({
    step1Data: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['next', 'prev']);

  const [register, { validate, setProps }] = useForm({
    labelWidth: 100,
    schemas: step2Schemas,
    actionColOptions: {
      span: 20,
    },
    resetButtonOptions: {
      text: '返回修改',
    },
    submitButtonOptions: {
      text: '确认创建',
    },
    resetFunc: customResetFunc,
    submitFunc: customSubmitFunc,
    compact: true,
  });
  const fileImg = computed(() => {
    return getFileIconUrl(props.step1Data.file);
  });
  async function customResetFunc() {
    emit('prev');
  }

  async function customSubmitFunc() {
    try {
      const values = await validate();
      setProps({
        submitButtonOptions: {
          loading: true,
        },
      });

      // 验证确认复选框
      if (!values.confirm) {
        setProps({
          submitButtonOptions: {
            loading: false,
          },
        });
        createMessage.error('请确认图书信息后，勾选"确认创建 "');
        return;
      }
      // 移除confirm字段，不提交到后端
      const { confirm, ...restValues } = values;

      const finalBookData = {
        ...props.step1Data,
        ...restValues,
      };
      console.log('finalBookData:', finalBookData);
      // 调用API创建图书
      try {
        const response = await createBookApi(finalBookData);

        if (response === true) {
          // axios 自动将result过滤出来
          const bookMenuList = await parseEpubApi({
            bookFilePath: finalBookData.file,
          });

          createMessage.success('图书创建成功');
          // 传递图书信息到第三步
          emit('next', {
            title: finalBookData.title,
            author: finalBookData.author || '匿名',
            cover: finalBookData.cover || '',
            file: finalBookData.file || '',
            publisher: finalBookData.publisher || '未知出版社',
            categoryName: finalBookData.categoryName || '',
            language: finalBookData.language || '未知语言',
            bookMenuList: bookMenuList || [],
          });
        }
      } catch (error) {
        console.log('错误:', error);

        createMessage.error('图书创建失败,联系管理员');
      }
    } catch (error) {
      setProps({
        submitButtonOptions: {
          loading: false,
        },
      });
    }
  }
</script>
