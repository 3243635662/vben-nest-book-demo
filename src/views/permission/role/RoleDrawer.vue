<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="500px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm">
      <template #menu="{ model, field }">
        <BasicTree
          v-model:value="model[field]"
          :treeData="treeData"
          :fieldNames="{ title: 'name', key: 'id' }"
          checkable
          toolbar
          title="菜单分配"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, watch } from 'vue';
  import { BasicForm, useForm } from '@/components/Form';
  import { formSchemaFunction } from './role.data';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { BasicTree, TreeItem } from '@/components/Tree';
  import {
    getMenuList,
    createRole,
    updateRole,
    assignMenu,
    getRoleMenuList,
  } from '@/api/demo/system';
  import { useMessage } from '@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(false);
  const treeData = ref<TreeItem[]>([]);
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 90,
    baseColProps: { span: 24 },
    // 既然我已经是进行动态监听了 那么初始化直接就不传状态得了
    schemas: formSchemaFunction(null),
    showActionButtonGroup: false,
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    resetFields();
    setDrawerProps({ confirmLoading: false });
    // 需要在setFieldsValue之前先填充treeData，否则Tree组件可能会报key not exist警告
    if (unref(treeData).length === 0) {
      // const menuList = await getMenuList();
      // treeData.value = menuList as any as TreeItem[];
      treeData.value = (await getMenuList()) as any as TreeItem[];
    }
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      const roleMenuList = await getRoleMenuList(data.record.id);
      const menuIds = roleMenuList.map((item) => item.menuId);
      setFieldsValue({
        ...data.record,
        menu: menuIds,
      });
    }
  });
  // 修复： 监听isUpdate变化，动态更新表单配置
  watch(isUpdate, (newVal) => {
    updateSchema(formSchemaFunction(ref(newVal)));
  });
  const getTitle = computed(() => (!unref(isUpdate) ? '新增角色' : '编辑角色'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });
      console.log('提交表单', values);

      if (unref(isUpdate)) {
        const res = await updateRole(values);
        if (res) {
          createMessage.success('更新成功');
        } else {
          createMessage.error('更新失败');
        }
      } else {
        const res = await createRole(values);
        if (res) {
          createMessage.success('新增成功');

          // 将创建好的role的Id解析出来准备对role-menu进行关联
          const { id: roleId } = res;
          const { menu: menuIds = [] } = values;
          if (roleId && menuIds.length > 0) {
            const res = await assignMenu({ roleId, menuIds });
            if (res) {
              createMessage.success('菜单分配成功');
            } else {
              createMessage.error('菜单分配失败');
            }
          }
        } else {
          createMessage.error('新增失败');
        }
      }
      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
