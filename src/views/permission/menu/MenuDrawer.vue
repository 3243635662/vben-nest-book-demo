<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="50%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '@/components/Form';
  import { formSchema } from './menu.data';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { createMenu, updateMenu } from '@/api/sys/menu';
  import { getMenuList } from '@/api/demo/system';
  import { useMessage } from '@/hooks/web/useMessage';

  const { createMessage } = useMessage();

  defineOptions({ name: 'MenuDrawer' });

  const emit = defineEmits(['success', 'register']);

  const isUpdate = ref(true);

  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    labelWidth: 100,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { lg: 12, md: 24 },
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    resetFields();
    setDrawerProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      // 处理编辑时数据类型转换，确保status字段为字符串类型（前端改也可以 后端改也可以）
      // const record = { ...data.record };
      // if (record.status !== undefined) {
      //   record.status = String(record.status);
      // }
      // setFieldsValue(record);
      setFieldsValue({
        ...data.record,
      });      
      

    }
    const treeData = await getMenuList();
    console.log(treeData);

    updateSchema({
      field: 'pid',
      componentProps: { treeData },
    });
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增菜单' : '编辑菜单'));
  const isUpdateMenu = computed(() => unref(isUpdate));
  // Record<string, any> 表示 键是字符串，值可以是任意类型 的对象
  // Partial<T> 将类型 T 的所有属性变为 可选的
  // 合并对象工具函数 - 使用函数式编程
  function mergeWithDefaults<T extends Record<string, any>>(defaults: T, values: Partial<T>,isUpdateMenu: boolean): T {
    const result = { ...defaults };

    Object.keys(defaults).forEach((key) => {
      const value = values[key];
      if (value !== undefined) {
        result[key as keyof T] = value as T[keyof T];
      }
    });

    return result;
  }

  async function handleSubmit() {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });

      // 设置默认值配置
      let defaultValues = {
        id: 0, // 菜单ID
        name: '', // 菜单名称
        pid: 0, // 上级菜单ID
        redirect: '', // 重定向地址
        meta: '', // 元数据
        status: '1', // 状态
        icon: '', // 图标
        path: '', // 路由地址
      };

      // 使用函数合并默认值
      let processedValues = mergeWithDefaults(defaultValues, values, isUpdateMenu.value);

      // 如果是新增菜单，去除id字段
      if (!isUpdateMenu.value) {
        // 使用类型断言解决TypeScript类型检查问题
        const valuesWithId = processedValues as any;
        if ('id' in valuesWithId) {
          delete valuesWithId.id;
        }
      }

      // 转换字段类型并创建最终提交数据
      const submitValues = {
        ...processedValues,
        status: Number(processedValues.status),
        pid: Number(processedValues.pid) || 0,
      };
        console.log(submitValues);

      try {
        if (!isUpdateMenu.value) {
        await createMenu(submitValues);
        createMessage.success('新增菜单成功')
        }
        else{
          await updateMenu(submitValues);
          createMessage.success('编辑菜单成功')
        }
      } catch {
        createMessage.error(isUpdateMenu.value ? '编辑菜单失败' : '新增菜单失败');
      }
      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
