<template>
  <PageWrapper title="创建图书" contentBackground content="请按照要求填写信息" contentClass="p-4">
    <div class="step-form-form">
      <Steps :current="current">
        <Steps.Step title="填写图书信息" />
        <Steps.Step title="确认图书信息" />
        <Steps.Step title="完成" />
      </Steps>
    </div>
    <div class="mt-5 flex justify-center">
      <Step1 @next="handleStep1Next" v-show="current === 0" />
      <Step2
        @prev="handleStepPrev"
        @next="handleStep2Next"
        v-show="current === 1"
        v-if="state.initStep2"
        :step1Data="state.step1Data"
      />
      <Step3
        v-show="current === 2"
        @redo="handleRedo"
        @view="handleView"
        v-if="state.initStep3"
        :bookInfo="state.bookInfo"
      />
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import Step1 from './Step1.vue';
  import Step2 from './Step2.vue';
  import Step3 from './Step3.vue';
  import { PageWrapper } from '@/components/Page';
  import { Steps } from 'ant-design-vue';
  import { useRouter } from 'vue-router';

  defineOptions({ name: 'FormStepPage' });

  const current = ref(0);
  const router = useRouter();

  const state = reactive({
    initStep2: false,
    initStep3: false,
    step1Data: {},
    bookInfo: {},
  });

  function handleStep1Next(step1Values: any) {
    current.value++;
    state.initStep2 = true;
    state.step1Data = step1Values;
    // console.log('第一步数据:', step1Values);
  }

  function handleStepPrev() {
    current.value--;
  }

  function handleStep2Next(step2Values: any) {
    current.value++;
    state.initStep3 = true;
    // 存储图书信息
    state.bookInfo = step2Values;
    console.log('图书信息:', step2Values);
  }

  function handleRedo() {
    current.value = 0;
    state.initStep2 = false;
    state.initStep3 = false;
    state.bookInfo = {};
  }

  function handleView() {
    router.push({
      path: '/book/list',
    });
  }
</script>
<style lang="less" scoped>
  .step-form-content {
    padding: 24px;
    background-color: @component-background;
  }

  .step-form-form {
    width: 750px;
    margin: 0 auto;
  }
</style>
