<template>
  <div class="step1">
    <div class="step1-form center">
      <BasicForm @register="register" />
    </div>
    <Divider />
    <h3>图书信息填写</h3>
    <h4>必填信息</h4>
    <p> 请填写图书的书名，这是创建图书的唯一必填项。 </p>

    <h4>可选信息</h4>
    <p>
      您可以上传封面图片和电子书文件（支持PDF、EPUB等格式），也可以填写作者、出版社等其他信息。
    </p>
  </div>
</template>
<script lang="ts" setup>
  import { BasicForm, useForm } from '@/components/Form';
  import { step1Schemas } from './data';

  import { Divider } from 'ant-design-vue';

  const emit = defineEmits(['next']);

  const [register, { validate }] = useForm({
    labelWidth: 60,
    schemas: step1Schemas,
    actionColOptions: {
      span: 24,
    },
    showResetButton: false,
    submitButtonOptions: {
      text: '下一步',
    },
    submitFunc: customSubmitFunc,
    compact: true,
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  });

  async function customSubmitFunc() {
    try {
      const values = await validate();
      console.log('原始表单数据:', values);
      
      // 处理上传字段：确保cover和file是URL字符串而不是数组
      const processedValues = { ...values };
      
      // 处理cover字段 - 直接使用URL
      if (processedValues.cover) {
        if (Array.isArray(processedValues.cover)) {
          // 如果是数组，取第一个元素的url
          processedValues.cover = processedValues.cover.length > 0 
            ? processedValues.cover[0] 
            : '';
        }
        console.log('处理后的cover:', processedValues.cover);
      }
      
      // 处理file字段 - 直接使用URL
      if (processedValues.file) {
        if (Array.isArray(processedValues.file)) {
          // 如果是数组，取第一个元素的url
          processedValues.file = processedValues.file.length > 0 
            ? processedValues.file[0] 
            : '';
        }
        console.log('处理后的file:', processedValues.file);
      }
      
      // 过滤掉空值，但保留cover和file字段（即使是空字符串）
      const filteredValues = Object.fromEntries(
        Object.entries(processedValues).filter(([key, value]) => {
          // 保留cover和file字段，即使它们是空字符串
          if (key === 'cover' || key === 'file') {
            return value !== null && value !== undefined;
          }
          // 其他字段过滤掉空值
          return value !== '' && value !== null && value !== undefined;
        }),
      );
      
      console.log('第一步处理后的数据:', filteredValues);
      emit('next', filteredValues);
    } catch (error) {
      console.error('第一步处理错误:', error);
    }
  }
</script>
<style lang="less" scoped>
  .step1 {
    &-form {
      width: 290px;
      margin: 0 auto;

      :deep(.ant-form-item-control) {
        text-align: center;
      }

      :deep(.ant-form-item-label) {
        text-align: left;
      }
    }

    h3 {
      margin: 0 0 12px;
      color: @text-color-base;
      font-size: 16px;
      line-height: 32px;
    }

    h4 {
      margin: 0 0 4px;
      color: @text-color-base;
      font-size: 14px;
      line-height: 22px;
    }

    p {
      color: @text-color-base;
      line-height: 1.6;
    }
  }
</style>
