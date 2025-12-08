<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <MerchantTree class="w-1/4 xl:w-1/5" @select="handleSelect" />
    <BasicTable @register="registerTable" class="w-3/4 xl:w-4/5">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新增账号</a-button>
        <a-button type="primary" @click="handleExport">导出账号</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:info-standard-line',
                tooltip: '查看账号详情',
                onClick: handleView.bind(null, record),
              },
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑账号资料',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                tooltip: '删除此账号',
                popConfirm: {
                  title: '是否确认删除此账号',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <AccountModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';

  import { BasicTable, useTable, TableAction } from '@/components/Table';
  import { getMerchantAccountList, getArea } from '@/api/demo/system';
  import { PageWrapper } from '@/components/Page';
  import MerchantTree from './MerchantTree.vue';

  import { useModal } from '@/components/Modal';
  import AccountModal from './AccountModal.vue';

  import { columns, searchFormSchema } from './account.data';
  import { useGo } from '@/hooks/web/usePage';
  import { deleteAccount } from '@/api/demo/system';
  import { useMessage } from '@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  defineOptions({ name: 'AccountManagement' });

  const go = useGo();
  const [registerModal, { openModal }] = useModal();
  const areaOptions = ref<{ label: string; value: string }[]>([]);

  const [registerTable, { reload, getSearchInfo, getForm, setColumns }] = useTable({
    title: '账号列表',
    api: getMerchantAccountList,
    rowKey: 'id',
    // 自定义分页参数映射
    fetchSetting: {
      // 当前页字段名
      pageField: 'page',
      // 每页条数字段名，后端使用limit
      sizeField: 'limit',
      // 列表数据字段名
      listField: 'items',
      // 总条数字段名，后端返回的是meta.totalItems
      totalField: 'meta.totalItems',
    },
    // 设置默认每页条数
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['5', '10', '20', '50'],
      showSizeChanger: true,
      showQuickJumper: true,
    },
    columns: columns.map((col) => {
      if (col.dataIndex === 'area') {
        return {
          ...col,
          customRender: ({ text }) => {
            // 直接显示地区文本，因为API返回的地区字段已经是文本格式
            return text || '未知地区';
          },
        };
      }
      return col;
    }),
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema.map((schema) => {
        if (schema.field === 'area') {
          return {
            ...schema,
            componentProps: {
              ...schema.componentProps,
              options: areaOptions.value,
            },
          };
        }
        return schema;
      }),
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    handleSearchInfoFn(info) {
      // 处理搜索参数，传递给后端API
      // 只返回搜索表单中的参数，不包含merchantId等其他参数
      interface SearchParamsType {
        username?: string;
        area?: string;
      }
      const searchParams: SearchParamsType = {};

      if (info.username) {
        searchParams.username = info.username;
      }

      if (info.area) {
        searchParams.area = info.area;
      }

      return searchParams;
    },
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      // slots: { customRender: 'action' },
    },
  });

  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }

  function handleEdit(record: Recordable) {
    console.log(record);
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  async function handleDelete(record: Recordable) {
    let id = record.id;
    try {
      let res = await deleteAccount(id);
      if (res) {
        createMessage.success('删除成功');
        reload();
      } else {
        createMessage.error('删除失败');
      }
    } catch (error) {
      createMessage.error('删除失败');
    }
  }

  function handleExport() {
    console.log(getSearchInfo());
  }

  function handleSuccess({ isUpdate, values }) {
    if (isUpdate) {
      // 演示不刷新表格直接更新内部数据。
      // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
    } else {
      reload();
    }
  }

  function handleSelect(areaText = '') {
    // 获取表单实例
    const form = getForm();
    if (form) {
      // 将地区文本设置到搜索表单的area字段
      form.setFieldsValue({ area: areaText });
      // 提交表单触发搜索
      form.submit();
    }
  }

  function handleView(record: Recordable) {
    go('/system/account_detail/' + record.id);
  }

  // 获取地区数据
  async function fetchAreaOptions() {
    try {
      const areaData = await getArea();
      areaOptions.value = areaData.map((item) => ({
        label: item.text,
        value: item.text, // 使用text作为value，因为API返回的地区字段是文本
      }));

      // 更新搜索表单的地区选项
      const form = getForm();
      if (form) {
        form.updateSchema({
          field: 'area',
          componentProps: {
            options: areaOptions.value,
          },
        });
      }

      // 动态更新表格列的地区映射配置
      const areaMap = areaData.reduce((map, item) => {
        map[item.id] = item.text;
        return map;
      }, {});

      setColumns(
        columns.map((col) => {
          if (col.dataIndex === 'areaId') {
            return {
              ...col,
              customRender: ({ text }) => {
                return areaMap[text] || '未知地区';
              },
            };
          }
          return col;
        }),
      );
    } catch (error) {
      console.error('获取地区数据失败:', error);
    }
  }

  onMounted(() => {
    fetchAreaOptions();
  });
</script>
