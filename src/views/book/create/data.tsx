import { FormSchema } from '@/components/Form';

// 第一步：填写图书基本信息（核心信息）
export const step1Schemas: FormSchema[] = [
  {
    field: 'title',
    component: 'Input',
    label: '书名',
    required: true,
    componentProps: {
      placeholder: '请输入书名',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'cover',
    component: 'Input',
    label: '封面图片',
    required: false,
    componentProps: {
      placeholder: '请上传封面图片（可选）',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'fileName',
    component: 'Input',
    label: '文件',
    required: false,
    componentProps: {
      placeholder: '请上传电子书文件（PDF、EPUB等格式）',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'author',
    component: 'Input',
    label: '作者',
    required: false,
    defaultValue: '匿名',
    componentProps: {
      placeholder: '请输入作者名称（可选）',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'publisher',
    component: 'Input',
    label: '出版社',
    required: false,
    defaultValue: '未知出版社',
    componentProps: {
      placeholder: '请输入出版社名称（可选）',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'bookid',
    component: 'Input',
    label: '图书编码',
    required: false,
    defaultValue: '未知编码',
    componentProps: {
      placeholder: '请输入图书编码（可选）',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'categoryName',
    component: 'Input',
    label: '分类名称',
    required: false,
    defaultValue: '未知分类',
    componentProps: {
      placeholder: '请输入分类名称（可选）',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'language',
    component: 'Input',
    label: '语言',
    required: false,
    defaultValue: '中文',
    componentProps: {
      placeholder: '请输入语言（可选）',
    },
    colProps: {
      span: 24,
    },
  },
];

// 第二步：确认图书信息（简洁确认）
export const step2Schemas: FormSchema[] = [
  {
    field: 'description',
    component: 'InputTextArea',
    label: '图书简介',
    required: false,
    defaultValue: '',
    componentProps: {
      placeholder: '请输入图书简介（可选）',
      rows: 3,
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'tags',
    component: 'Input',
    label: '标签',
    required: false,
    defaultValue: '',
    componentProps: {
      placeholder: '请输入标签，用逗号分隔（可选）',
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'status',
    component: 'RadioGroup',
    label: '发布状态',
    required: true,
    defaultValue: 'draft',
    componentProps: {
      options: [
        { label: '草稿', value: 'draft' },
        { label: '发布', value: 'published' },
      ],
    },
    colProps: {
      span: 24,
    },
  },
  {
    field: 'confirm',
    component: 'Checkbox',
    label: '确认创建',
    required: true,
    defaultValue: false,
    componentProps: {
      placeholder: '我已确认上述图书信息无误，同意创建',
    },
    colProps: {
      span: 24,
    },
  },
];
