import { FormSchema } from '@/components/Form';
import { uploadApi } from '@/api/sys/upload';

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
    component: 'ImageUpload',
    label: '封面图片',

    colProps: {
      span: 8,
    },
    componentProps: {
      // 封面最多一个
      maxNumber: 1,
      // 修改resultField以获取完整结果对象
      resultField: 'result',
      api: (file, progress) => {
        return new Promise((resolve) => {
          uploadApi(file, progress).then((uploadApiResponse) => {
            // 保留完整的result数据，包括fileName和filePath
            resolve(uploadApiResponse.data);
          });
        });
      },
    },
  },
  /*
  // {
  //   field: 'cover',
  //   component: 'Input',
  //   label: '封面图片',
  //   required: false,
  //   componentProps: {
  //     placeholder: '请上传封面图片（可选）',
  //   },
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   field: 'fileName',
  //   component: 'Input',
  //   label: '文件',
  //   required: false,
  //   componentProps: {
  //     placeholder: '请上传电子书文件（PDF、EPUB等格式）',
  //   },
  //   colProps: {
  //     span: 24,
  //   },
  // },
  */
  {
    field: 'file',
    component: 'Upload',
    label: '电子书文件',
    componentProps: {
      // 文件最多1
      maxNumber: 1,
      // 将resultField从'file.url'改为'result'以获取完整响应
      resultField: 'result',
      api: (file, progress) => {
        return new Promise((resolve) => {
          uploadApi(file, progress).then((uploadApiResponse) => {
            // 直接返回完整响应数据而非包装对象
            resolve(uploadApiResponse.data);
          });
        });
      },
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
    field: 'categoryName',
    component: 'Input',
    label: '标签',
    required: false,
    defaultValue: '',
    componentProps: {
      placeholder: '请输入分类，用逗号分隔（可选）',
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
      // placeholder 属性在 Checkbox 组件中不被支持，移除即可
    },
    colProps: {
      span: 24,
    },
  },
];
