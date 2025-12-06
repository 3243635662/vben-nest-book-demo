<template>
  <div>
    <Upload
      v-bind="$attrs"
      v-model:file-list="fileList"
      :list-type="listType"
      :accept="getStringAccept"
      :multiple="multiple"
      :maxCount="maxNumber"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      :disabled="disabled"
      @preview="handlePreview"
      @remove="handleRemove"
    >
      <div v-if="fileList && fileList.length < maxNumber">
        <plus-outlined />
        <div style="margin-top: 8px">{{ t('component.upload.upload') }}</div>
      </div>
    </Upload>
    <Modal :open="previewOpen" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="" style="width: 100%" :src="previewImage" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, toRefs, watch } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import type { UploadFile, UploadProps } from 'ant-design-vue';
  import { Modal, Upload } from 'ant-design-vue';
  import { UploadRequestOption } from 'ant-design-vue/lib/vc-upload/interface';
  import { useMessage } from '@/hooks/web/useMessage';
  import { isArray, isFunction, isObject, isString } from '@/utils/is';
  import { warn } from '@/utils/log';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useUploadType } from '../hooks/useUpload';
  import { uploadContainerProps } from '../props';
  import { checkFileType } from '../helper';
  import { UploadResultStatus } from '@/components/Upload/src/types/typing';
  import { get, omit } from 'lodash-es';
  import { deleteFileApi } from '@/api/sys/upload'; // 添加导入

  defineOptions({ name: 'ImageUpload' });

  const emit = defineEmits(['change', 'update:value', 'delete']);
  const props = defineProps({
    ...omit(uploadContainerProps, ['previewColumns', 'beforePreviewData']),
  });
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const { accept, helpText, maxNumber, maxSize } = toRefs(props);
  const isInnerOperate = ref<boolean>(false);
  const { getStringAccept } = useUploadType({
    acceptRef: accept,
    helpTextRef: helpText,
    maxNumberRef: maxNumber,
    maxSizeRef: maxSize,
  });
  const previewOpen = ref<boolean>(false);
  const previewImage = ref<string>('');
  const previewTitle = ref<string>('');

  const fileList = ref<UploadProps['fileList']>([]);
  const isLtMsg = ref<boolean>(true);
  const isActMsg = ref<boolean>(true);
  const isFirstRender = ref<boolean>(true);

  watch(
    () => props.value,
    (v) => {
      if (isInnerOperate.value) {
        isInnerOperate.value = false;
        return;
      }
      let value: string[] = [];
      if (v) {
        if (isArray(v)) {
          value = v;
        } else {
          value.push(v);
        }
        fileList.value = value.map((item, i) => {
          if (item && isString(item)) {
            return {
              uid: -i + '',
              name: item.substring(item.lastIndexOf('/') + 1),
              status: 'done',
              url: item,
            };
          } else if (item && isObject(item)) {
            // 确保对象包含必要的字段
            const fileItem = item as any;
            return {
              uid: fileItem.uid || -i + '',
              name: fileItem.name || fileItem.fileName,
              status: fileItem.status || 'done',
              url: fileItem.url || fileItem.response?.url,
              response: fileItem.response, // 保留响应数据
              ...fileItem,
            };
          } else {
            return;
          }
        }) as UploadProps['fileList'];
      }
      emit('update:value', value);
      if (!isFirstRender.value) {
        emit('change', value);
        isFirstRender.value = false;
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  // 获取上传的图片的Base64编码  用于图像回显
  function getBase64<T extends string | ArrayBuffer | null>(file: File) {
    return new Promise<T>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as T);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // 执行预览
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64<string>(file.originFileObj!);
    }
    previewImage.value = file.url || file.preview || '';
    previewOpen.value = true;
    previewTitle.value =
      file.name || previewImage.value.substring(previewImage.value.lastIndexOf('/') + 1);
  };

  // 执行删除
  const handleRemove = async (file: UploadFile) => {
    if (fileList.value) {
      let fileName = '';
      if (file.response) {
        if (file.response.data?.result?.fileName) {
          fileName = file.response.data.result.fileName;
        }
      }
      console.log(file.response.data.result.url);
      if (fileName) {
        try {
          await deleteFileApi(fileName);
        } catch (error) {
          console.error('删除文件时出错:', error);
        }
      } else {
        // 如果没有正常获取到fileName 那就直接干脆从url中获取 fileName
        fileName = file.url?.split('/').pop() || '';
      }

      // 从前端文件列表中移除
      const index = fileList.value.findIndex((item) => item.uid === file.uid);
      index !== -1 && fileList.value.splice(index, 1);
      const value = getValue();
      isInnerOperate.value = true;
      emit('update:value', value);
      emit('change', value);
      emit('delete', file);
    }
  };

  const handleCancel = () => {
    previewOpen.value = false;
    previewTitle.value = '';
  };

  //做一个上传前的校验
  const beforeUpload = (file: File) => {
    const { maxSize, accept } = props;
    const isAct = checkFileType(file, accept);
    if (!isAct) {
      createMessage.error(t('component.upload.acceptUpload', [accept]));
      isActMsg.value = false;
      // 防止弹出多个错误提示
      setTimeout(() => (isActMsg.value = true), 1000);
    }
    const isLt = file.size / 1024 / 1024 > maxSize;
    if (isLt) {
      createMessage.error(t('component.upload.maxSizeMultiple', [maxSize]));
      isLtMsg.value = false;
      // 防止弹出多个错误提示
      setTimeout(() => (isLtMsg.value = true), 1000);
    }
    return (isAct && !isLt) || Upload.LIST_IGNORE;
  };

  async function customRequest(info: UploadRequestOption<any>) {
    const { api, uploadParams = {}, name, filename, resultField } = props;
    if (!api || !isFunction(api)) {
      return warn('upload api must exist and be a function');
    }
    try {
      const res = await api?.({
        data: {
          ...uploadParams,
        },
        file: info.file,
        name: name,
        filename: filename,
      });

      // 安全地获取返回数据，兼容不同的响应格式
      const result = res.result || res;
      const url = result.url || result.filePath || '';
      const fileName = result.fileName || result.name;

      if (fileName) {
        (info.file as any).fileName = fileName;
      }

      // 保存完整的响应数据到文件对象
      const responseData = {
        url: url,
        fileName: fileName,
        result: result, // 保存完整的result对象
        data: res.data || result, // 保存data结构，确保有时间戳文件名
        ...result,
      };

      // 使用forceUpdate方式确保数据被保存
      const fileIndex = fileList.value?.findIndex((f) => f.uid === (info.file as any).uid);
      if (fileIndex !== undefined && fileIndex !== -1 && fileList.value) {
        // 直接更新fileList中的文件对象
        fileList.value[fileIndex] = {
          ...fileList.value[fileIndex],
          response: responseData,
          url: url,
          status: 'done',
        } as any;
      }

      // 同时设置到info.file对象
      (info.file as any).response = responseData;
      (info.file as any).url = url;

      // 返回包含url的数据
      info.onSuccess!(responseData); // 传递完整的响应数据

      const value = getValue();
      isInnerOperate.value = true;
      emit('update:value', value);
      emit('change', value);
    } catch (e: any) {
      console.log(e);
      info.onError!(e);
    }
  }

  function getValue() {
    const list = (fileList.value || [])
      .filter((item) => item?.status === UploadResultStatus.DONE)
      .map((item: any) => {
        // 将响应数据返回给调用此组件的函数或者值
        return item?.response.data.result || '';
      });

    // 如果设置了maxNumber为1，则返回单个值而不是数组
    // return props.maxNumber === 1 ? list[0] || '' : list;
    return list;
  }
</script>

<style lang="less">
  .ant-upload-select-picture-card i {
    color: #999;
    font-size: 32px;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
</style>
