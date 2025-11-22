<template>
  <div class="step1">
    <div class="step1-form">
      <BasicForm @register="register" />
    </div>
    <Divider />
    <h3>图书信息填写</h3>
    <h4>必填信息</h4>
    <p>
      请填写图书的书名，这是创建图书的唯一必填项。
    </p>

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
  });

  async function customSubmitFunc() {
    try {
      const values = await validate();
      // 过滤掉空值，只保留有值的字段
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );
      emit('next', filteredValues);
    } catch (error) {
      //
    }
  }
</script>
<style lang="less" scoped>
  .step1 {
    &-form {
      width: 310px;
      margin: 0 auto;
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
