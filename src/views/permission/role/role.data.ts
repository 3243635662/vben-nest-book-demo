import { BasicColumn, FormSchema } from '@/components/Table';
// import { h } from 'vue';
// import { Switch } from 'ant-design-vue';
// import { setRoleStatus } from '@/api/demo/system';
// import { useMessage } from '@/hooks/web/useMessage';

// type CheckedType = boolean | string | number;
export const columns: BasicColumn[] = [
  {
    title: '角色ID',
    dataIndex: 'id',
    width: 200,
  },
  {
    title: '角色名称',
    dataIndex: 'name',
    width: 180,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180,
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '角色名称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'name',
    label: '角色名称',
    required: true,
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },

  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
  },
  {
    label: ' ',
    field: 'menu',
    slot: 'menu',
  },
];
