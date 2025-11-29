import { getRoleList, isAccountExist } from '@/api/demo/system';
import { BasicColumn, FormSchema } from '@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '账号名称',
    dataIndex: 'username',
    width: 120,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180,
  },
  {
    title: '角色',
    dataIndex: 'roles',
    width: 200,
    customRender: ({ value }) => {
      try {
        const roles = JSON.parse(value);
        return Array.isArray(roles) ? roles.join(', ') : value;
      } catch {
        return value;
      }
    },
  },
  {
    title: '所属地区',
    dataIndex: 'areaId',
    width: 120,
    customRender: ({ text }) => {
      // 地区映射将在index.vue中动态设置
      return text || '未知地区';
    },
  },
  {
    title: '状态',
    dataIndex: 'active',
    width: 80,
    customRender: ({ value }) => {
      return value === 1 ? '启用' : '禁用';
    },
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '账号名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'area',
    label: '所属地区',
    component: 'Select',
    componentProps: {
      options: [],
      placeholder: '请选择地区',
    },
    colProps: { span: 8 },
  },
];

export const accountFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '账号名称',
    component: 'Input',
    helpMessage: ['不能输入带有admin的账号名称'],
    rules: [
      {
        required: true,
        message: '请输入账号名称',
      },
      {
        trigger: 'blur',
        validator(_, value) {
          return new Promise((resolve, reject) => {
            if (!value) return resolve();
            isAccountExist(value)
              .then(resolve)
              .catch((err) => {
                reject(err.message || '验证失败');
              });
          });
        },
      },
    ],
  },
  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
    required: true,
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
    ifShow: true,
  },
  {
    field: 'role',
    label: '角色',
    component: 'ApiSelect',
    componentProps: {
      api: getRoleList,
      labelField: 'remark',
      valueField: 'id',
    },
    required: true,
  },
  {
    field: 'area',
    label: '所属地区',
    component: 'TreeSelect',
    componentProps: {
      fieldNames: {
        label: 'text',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
    required: true,
  },

  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
  },
];
