<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 新增角色 </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <RoleDrawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '@/components/Table';
  import { getRoleList, deleteRole } from '@/api/demo/system';

  import { useDrawer } from '@/components/Drawer';
  import RoleDrawer from './RoleDrawer.vue';

  import { columns, searchFormSchema } from './role.data';

  defineOptions({ name: 'RoleManagement' });
  import { useMessage } from '@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    title: '角色列表',
    api: getRoleList,
    rowKey: 'id',
    fetchSetting: {
      pageField: 'page',
      sizeField: 'limit',
      listField: 'items',
      totalField: 'meta.totalItems',
    },
    // 设置默认每页条数
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['5', '10', '20', '50'],
      showSizeChanger: true,
      showQuickJumper: true,
    },
    columns,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema,
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    showIndexColumn: false,
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      // slots: { customRender: 'action' },
      fixed: undefined,
    },
  });

  function handleCreate() {
    openDrawer(true, {
      isUpdate: false,
    });
  }

  function handleEdit(record: Recordable) {
    openDrawer(true, {
      record,
      isUpdate: true,
    });
  }

  async function handleDelete(record: Recordable) {
    let roleId = record.id;
    try {
      const res = await deleteRole(roleId);
      if (res) {
        createMessage.success('删除成功');
      } else {
        createMessage.error('删除失败');
      }
    } catch (error) {
      createMessage.error('删除失败');
    }
    reload();
  }

  function handleSuccess() {
    reload();
  }
</script>
