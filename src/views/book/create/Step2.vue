<template>
  <div class="w-90 m-auto">
    <Alert message="请确认图书信息，确认后将创建新的图书记录。" show-icon type="info" />
    <Descriptions :column="1" class="mt-5" bordered>
      <Descriptions.Item label="书名"> {{ step1Data.title }} </Descriptions.Item>
      <Descriptions.Item label="封面图片" v-if="coverData">
        <div v-if="typeof coverData === 'string'">
          <img
            :src="coverData"
            alt="封面图片"
            style="max-width: 200px; max-height: 300px; border-radius: 4px"
          />
        </div>
        <div v-else>
          {{ JSON.stringify(coverData) }}
        </div>
      </Descriptions.Item>
      <Descriptions.Item label="电子书文件" v-if="fileData">
        <div v-if="typeof fileData === 'string'">
          <img
            :src="getSafeFileIconUrl(fileData)"
            alt="文件图标"
            style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle"
          />
          <span>{{ getSafeFileName(fileData) }}</span>
        </div>
        <div v-else>
          {{ JSON.stringify(fileData) }}
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
  import { createBookApi } from '@/api/sys/upload';
  import { computed } from 'vue';
  const { createMessage } = useMessage();
  // 安全获取封面数据 - 增加调试信息
  const coverData = computed(() => {
    const cover = props.step1Data?.cover;
    console.log('Step2收到的cover数据:', cover, '类型:', typeof cover);

    if (!cover) return null;

    // 现在直接是URL字符串，无需复杂处理
    if (typeof cover === 'string') {
      return cover;
    }

    // 兼容处理：如果是数组，尝试提取URL
    if (Array.isArray(cover) && cover.length > 0) {
      return cover[0]?.url || cover[0]?.data?.url || cover[0]?.response?.url || '';
    }

    // 兼容处理：如果是对象，尝试提取URL
    if (typeof cover === 'object' && cover !== null) {
      return cover.url || cover.data?.url || cover.response?.url || '';
    }

    return null;
  });

  // 安全获取文件数据 - 增加调试信息
  const fileData = computed(() => {
    const file = props.step1Data?.file;
    console.log('Step2收到的file数据:', file, '类型:', typeof file);

    if (!file) return null;

    // 现在直接是URL字符串，无需复杂处理
    if (typeof file === 'string') {
      return file;
    }

    // 兼容处理：如果是数组，尝试提取URL
    if (Array.isArray(file) && file.length > 0) {
      return file[0]?.url || file[0]?.data?.url || file[0]?.response?.url || '';
    }

    // 兼容处理：如果是对象，尝试提取URL
    if (typeof file === 'object' && file !== null) {
      return file.url || file.data?.url || file.response?.url || '';
    }

    return null;
  });

  // 安全获取文件图标URL
  const getSafeFileIconUrl = (file: any): string => {
    try {
      let fileName = '';

      // 如果是字符串（URL），提取文件名
      if (typeof file === 'string') {
        const urlParts = file.split('/');
        fileName = urlParts[urlParts.length - 1] || '';
      } else {
        // 如果是对象，尝试获取文件名属性
        fileName = file?.name || file?.originalName || file?.fileName || '';
      }

      return getFileIconUrl(fileName); // 返回对应文件类型的图标
    } catch (error) {
      console.error('获取文件图标时出错:', error);
      return getFileIconUrl(''); // 返回默认图标
    }
  };

  // 安全获取文件名
  const getSafeFileName = (file: any): string => {
    try {
      // 如果是字符串（URL），直接返回文件名部分
      if (typeof file === 'string') {
        const urlParts = file.split('/');
        return urlParts[urlParts.length - 1] || '未知文件';
      }
      // 如果是对象，尝试获取文件名属性
      return file?.name || file?.originalName || file?.fileName || '未知文件';
    } catch (error) {
      console.error('获取文件名时出错:', error);
      return '未知文件';
    }
  };

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

  async function customResetFunc() {
    emit('prev');
  }

  // 添加对step1Data变化的监听，更新表单默认值

  // watch(
  //   () => props.step1Data,
  //   (newData) => {
  //     // 可以根据需要在这里更新表单默认值
  //     // 调试封面和文件数据
  //     if (newData.cover) {
  //       if (Array.isArray(newData.cover)) {
  //         // console.log('封面数组长度:', newData.cover.length);
  //         if (newData.cover.length > 0) {
  //           // console.log('第一个封面项:', newData.cover[0]);
  //         }
  //       }
  //     }
  //     if (newData.file) {
  //       // console.log('文件数据类型:', typeof newData.file);
  //       // console.log('文件数据:', newData.file);
  //       if (Array.isArray(newData.file)) {
  //         // console.log('文件数组长度:', newData.file.length);
  //       }
  //     }
  //   },
  //   { immediate: true },
  // );

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

      // 过滤掉空值，合并第一步和第二步的数据
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(
          ([_, value]) => value !== '' && value !== null && value !== undefined,
        ),
      );

      // 直接使用step1Data，现在上传组件直接返回URL字符串
      const bookData = {
        ...props.step1Data,
        ...filteredValues,
        // 确保cover和file是字符串
        cover: typeof props.step1Data.cover === 'string' ? props.step1Data.cover : '',
        file: typeof props.step1Data.file === 'string' ? props.step1Data.file : '',
      };

      console.log('合并后的数据:', bookData);

      // 清理数据，移除空值和undefined值，确保后端接收到的数据格式正确
      const cleanData = (obj: any) => {
        const result: any = {};
        for (const key in obj) {
          // 特殊处理cover和file字段，保留空字符串
          if (key === 'cover' || key === 'file') {
            if (obj[key] !== null && obj[key] !== undefined) {
              result[key] = obj[key];
            }
          } else if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
            result[key] = obj[key];
          }
        }
        return result;
      };

      // 清理数据
      const finalBookData = cleanData(bookData);
      console.log('最终清理后的数据:', finalBookData);

      // 确保必要字段存在
      if (!finalBookData.title) {
        createMessage.error('图书标题不能为空');
        return;
      }
      console.log('最终提交数据:', finalBookData);

      // 调用API创建图书
      try {
        const response = await createBookApi(finalBookData);

        if (response === true) {
          createMessage.success('图书创建成功');
          // 传递图书信息到第三步
          emit('next', {
            title: finalBookData.title,
            author: finalBookData.author || '匿名',
            cover: finalBookData.cover || '',
            file: finalBookData.file || '',
            publisher: finalBookData.publisher || '未知出版社',
            categoryName: finalBookData.categoryName || '',
          });
        }
      } catch (error) {
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
