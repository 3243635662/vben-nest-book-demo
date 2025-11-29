<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { accountFormSchemaFunction } from './account.data';
  import { getArea, createAccount } from '@/api/demo/system';
  import { useMessage } from '@/hooks/web/useMessage';

  const { createMessage } = useMessage();

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);

  const isUpdate = ref(true);
  const rowId = ref('');

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: accountFormSchemaFunction(isUpdate),
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      setFieldsValue({
        ...data.record,
      });
    }

    const treeData = await getArea();
    updateSchema([
      {
        field: 'pwd',
        show: !unref(isUpdate),
      },
      {
        field: 'area',
        componentProps: { treeData },
      },
    ]);
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增账号' : '编辑账号'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      // TODO custom api
      const res = await createAccount(values);
      if (res) {
        createMessage.success('新增账号成功');
        closeModal();
        emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
      }
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
