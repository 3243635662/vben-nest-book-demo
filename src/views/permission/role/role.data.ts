import { BasicColumn, FormSchema } from '@/components/Table';
import { unref, Ref } from 'vue';

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
/*
export const formSchema: FormSchema[] = [
  {
    field: 'name',
    label: '角色名称',
    required: true,
    component: 'Input',
    // 下面这个简单的动态是不行的 因为我们新增加话 name出现会导致 动态判断失效
    // ifShow({ values }) {
    //   return !values.name;
    // },
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
*/

export const formSchemaFunction = (isUpdate: Ref<boolean> | null): FormSchema[] => {
  return [
    {
      field: 'name',
      label: '角色名称',
      required: true,
      component: 'Input',
      componentProps: {
        disabled: unref(isUpdate) || false,
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
};
