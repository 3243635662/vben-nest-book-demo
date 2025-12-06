import { FormSchema } from '@/components/Form';

export const toolSearchSchemas: FormSchema[] = [
  {
    field: 'keyword',
    component: 'Input',
    label: '关键词',
    colProps: {
      span: 12,
    },
    componentProps: {
      placeholder: '请输入关键词',
    },
  },
];

// 配置表单属性，移除重置按钮
export const searchFormProps = {
  showResetButton: false,
  showSubmitButton: true,
  labelWidth: 50,
  compact: true,
};
