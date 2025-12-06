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
  //  TODO 完善数据显示
  async function customSubmitFunc() {
    try {
      const values = await validate();

      // 简洁处理：提取数组中的URL，字符串去空格，过滤空值
      const filteredValues = { ...values };
      filteredValues.cover = values.cover[0].url;
      filteredValues.file = values.file[0].url;
      console.log('filteredValues:', filteredValues);
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
