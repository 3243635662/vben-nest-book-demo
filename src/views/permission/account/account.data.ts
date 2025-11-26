import { getAllRoleList, isAccountExist } from '@/api/demo/system';
import { BasicColumn, FormSchema } from '@/components/Table';

/**
 * transform mock data
 * {
 *  0: '华东分部',
 * '0-0': '华东分部-研发部'
 * '0-1': '华东分部-市场部',
 *  ...
 * }
 */
export const deptMap = (() => {
  const pDept = ['华东分部', '华南分部', '西北分部'];
  const cDept = ['研发部', '市场部', '商务部', '财务部'];

  return pDept.reduce((map, p, pIdx) => {
    map[pIdx] = p;

    cDept.forEach((c, cIndex) => (map[`${pIdx}-${cIndex}`] = `${p}-${c}`));

    return map;
  }, {});
})();

export const columns: BasicColumn[] = [
  {
    title: '商家名称',
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
    dataIndex: 'area',
    width: 120,
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
    label: '商家名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'area',
    label: '所属地区',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const accountFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '商家名称',
    component: 'Input',
    helpMessage: ['不能输入带有admin的商家名称'],
    rules: [
      {
        required: true,
        message: '请输入商家名称',
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
    field: 'pwd',
    label: '密码',
    component: 'InputPassword',
    required: true,
    ifShow: true,
  },
  {
    label: '角色',
    field: 'role',
    component: 'ApiSelect',
    componentProps: {
      api: getAllRoleList,
      labelField: 'roleName',
      valueField: 'roleValue',
    },
    required: true,
  },
  {
    field: 'dept',
    label: '所属地区',
    component: 'TreeSelect',
    componentProps: {
      fieldNames: {
        label: 'deptName',
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
