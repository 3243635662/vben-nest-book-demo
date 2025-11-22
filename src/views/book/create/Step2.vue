<template>
  <div class="w-90 m-auto">
    <Alert message="请确认图书信息，确认后将创建新的图书记录。" show-icon type="info" />
    <Descriptions :column="1" class="mt-5" bordered>
      <Descriptions.Item label="书名"> {{ step1Data.title }} </Descriptions.Item>
      <Descriptions.Item label="封面图片" v-if="step1Data.cover">
        {{ step1Data.cover }}
      </Descriptions.Item>
      <Descriptions.Item label="电子书文件" v-if="step1Data.fileName">
        {{ step1Data.fileName }}
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
  import { BasicForm, useForm } from '@/components/Form';
  import { step2Schemas } from './data';
  import { Alert, Divider, Descriptions } from 'ant-design-vue';
  // import { watch } from 'vue';

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
  import { watch } from 'vue';

  watch(
    () => props.step1Data,
    (newData) => {
      // 可以根据需要在这里更新表单默认值
      console.log('收到第一步数据:', newData);
    },
    { immediate: true },
  );

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
        throw new Error('请确认图书信息无误');
      }

      // 过滤掉空值，合并第一步和第二步的数据
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(
          ([_, value]) => value !== '' && value !== null && value !== undefined,
        ),
      );

      const bookData = {
        ...props.step1Data,
        ...filteredValues,
      };

      setTimeout(() => {
        setProps({
          submitButtonOptions: {
            loading: false,
          },
        });
        emit('next', bookData);
      }, 1500);
    } catch (error) {
      setProps({
        submitButtonOptions: {
          loading: false,
        },
      });
      console.error(error);
      throw error;
    }
  }
</script>
