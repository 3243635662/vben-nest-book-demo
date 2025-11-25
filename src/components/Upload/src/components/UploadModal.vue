<template>
  <BasicModal
    width="800px"
    :title="t('component.upload.upload')"
    :okText="t('component.upload.save')"
    v-bind="$attrs"
    @register="register"
    @ok="handleOk"
    :closeFunc="handleCloseFunc"
    :maskClosable="false"
    :keyboard="false"
    class="upload-modal"
    :okButtonProps="getOkButtonProps"
    :cancelButtonProps="{ disabled: isUploadingRef }"
  >
    <template #centerFooter>
      <a-button
        @click="handleStartUpload"
        color="success"
        :disabled="!getIsSelectFile"
        :loading="isUploadingRef"
      >
        {{ getUploadBtnText }}
      </a-button>
    </template>

    <div class="upload-modal-toolbar">
      <Alert :message="getHelpText" type="info" banner class="upload-modal-toolbar__text" />

      <!-- 解释：
      accept： 文件类型限制
      multiple： 一次文件选择中是否可以选择多个文件
      before-upload： 上传前的回调，用于校验文件
      -->
      <Upload
        :accept="getStringAccept"
        :multiple="multiple"
        :before-upload="beforeUpload"
        :show-upload-list="false"
        class="upload-modal-toolbar__btn"
      >
        <a-button type="primary">
          {{ t('component.upload.choose') }}
        </a-button>
      </Upload>
    </div>
    <!-- 文件列表 -->
    <FileList
      v-model:dataSource="fileListRef"
      :columns="columns"
      :actionColumn="actionColumn"
      :openDrag="fileListOpenDrag"
      :dragOptions="fileListDragOptions"
    />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, toRefs, unref, computed, PropType } from 'vue';
  import { Upload, Alert } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  // hooks
  import { useUploadType } from '../hooks/useUpload';
  import { useMessage } from '@/hooks/web/useMessage';
  //   types
  import { FileItem, UploadResultStatus } from '../types/typing';
  import { handleFnKey, basicProps } from '../props';
  import { createTableColumns, createActionColumn } from './data';
  // utils
  import { checkImgType, getBase64WithFile } from '../helper';
  import { getFileIconUrl } from './data';
  import { buildUUID } from '@/utils/uuid';
  import { isFunction } from '@/utils/is';
  import { warn } from '@/utils/log';
  import FileList from './FileList.vue';
  import { useI18n } from '@/hooks/web/useI18n';
  // import { get } from 'lodash-es';

  // 从props导入各种配置项
  const props = defineProps({
    ...basicProps,
    previewFileList: {
      type: Array as PropType<string[] | any[]>,
      default: () => [],
    },
  });

  const emit = defineEmits(['change', 'register', 'delete']);

  const columns = createTableColumns();
  const actionColumn = createActionColumn(handleRemove);

  // 是否正在上传
  const isUploadingRef = ref(false);
  const fileListRef = ref<FileItem[]>([]);
  const { accept, helpText, maxNumber, maxSize } = toRefs(props);

  const { t } = useI18n();
  const [register, { closeModal }] = useModalInner();

  const { getStringAccept, getHelpText } = useUploadType({
    acceptRef: accept,
    helpTextRef: helpText,
    maxNumberRef: maxNumber,
    maxSizeRef: maxSize,
  });

  const { createMessage } = useMessage();

  const getIsSelectFile = computed(() => {
    return (
      fileListRef.value.length > 0 &&
      !fileListRef.value.every((item) => item.status === UploadResultStatus.SUCCESS)
    );
  });

  const getOkButtonProps = computed(() => {
    const someSuccess = fileListRef.value.some(
      (item) => item.status === UploadResultStatus.SUCCESS,
    );
    return {
      disabled: isUploadingRef.value || fileListRef.value.length === 0 || !someSuccess,
    };
  });

  const getUploadBtnText = computed(() => {
    const someError = fileListRef.value.some((item) => item.status === UploadResultStatus.ERROR);
    return isUploadingRef.value
      ? t('component.upload.uploading')
      : someError
        ? t('component.upload.reUploadFailed')
        : t('component.upload.startUpload');
  });

  // 上传前校验
  async function beforeUpload(file: File) {
    const { size, name } = file;
    const { maxSize } = props;
    // 设置最大值，则判断
    if (maxSize && file.size / 1024 / 1024 >= maxSize) {
      createMessage.error(t('component.upload.maxSizeMultiple', [maxSize]));
      return false;
    }
    // 基础文件信息
    const commonItem = {
      uuid: buildUUID(),
      file,
      size,
      name,
      percent: 0,
      type: name.split('.').pop(),
    };
    // 生成图片缩略图
    if (checkImgType(file)) {
      try {
        const { result: thumbUrl } = await getBase64WithFile(file);
        fileListRef.value = [...unref(fileListRef), { ...commonItem, thumbUrl }];
      } catch (error) {
        console.error('生成缩略图失败:', error);
        fileListRef.value = [...unref(fileListRef), commonItem];
      }
    } else {
      // 非图片文件添加默认thumbUrl（根据文件类型）
      const fileIconUrl = getFileIconUrl(name);
      fileListRef.value = [...unref(fileListRef), { ...commonItem, thumbUrl: fileIconUrl }];
    }
    return false;
  }

  // 上传
  async function uploadApiByItem(item: FileItem) {
    const { api } = props;
    if (!api || !isFunction(api)) {
      return warn('upload api must exist and be a function');
    }
    try {
      // 开始上传 状态设置成上传中
      item.status = UploadResultStatus.UPLOADING;
      const ret = await props.api?.(
        {
          data: {
            ...(props.uploadParams || {}),
          },
          file: item.file,
          name: props.name,
          filename: props.filename,
        },
        function onUploadProgress(progressEvent: ProgressEvent) {
          const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0;
          item.percent = complete;
        },
      );

      // 从响应中提取URL和文件名，兼容不同的响应格式
      const result = ret.data.result;

      const url = result.url || result.filePath || '';
      const fileName = result.fileName;
      // 设置文件名到item中，用于删除操作
      if (fileName) {
        (item as any).fileName = fileName;
      }

      // 设置URL
      item.url = url;
      item.status = UploadResultStatus.SUCCESS;
      item.response = {
        ...(item.response || {}),
        url: url,
        fileName: fileName,
        result: result, // 保存完整的响应数据
        data: ret.data || result, // 保存data结构，确保有时间戳文件名
      };

      return {
        success: true,
        error: null,
      };
    } catch (e) {
      console.log(e);
      item.status = UploadResultStatus.ERROR;
      return {
        success: false,
        error: e,
      };
    }
  }
  // 删除
  function handleRemove(obj: Record<handleFnKey, any>) {
    let { record = {}, uidKey = 'uid' } = obj;
    const index = fileListRef.value.findIndex((item) => item[uidKey] === record[uidKey]);
    if (index !== -1) {
      const removed = fileListRef.value.splice(index, 1);
      const removedItem = removed[0];

      // 获取文件名用于删除操作
      let fileName = null;

      // 优先使用服务器返回的文件名（带时间戳）
      if (removedItem.response) {
        const response = removedItem.response as any;

        if (response.data?.result?.fileName) {
          fileName = response.data.result.fileName;
        } else if (response.result?.fileName) {
          fileName = response.result.fileName;
        }
      }

      // 如果没有从response获取到，尝试其他方式
      if (!fileName) {
        // 尝试直接使用item的fileName
        fileName = removedItem.fileName || removedItem.name;
      }

      // 触发删除事件，传递文件名
      emit('delete', fileName || removedItem[uidKey]);
    }
  }
  // 点击开始上传
  async function handleStartUpload() {
    const { maxNumber } = props;
    if (fileListRef.value.length + props.previewFileList.length > maxNumber) {
      return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
    }
    try {
      isUploadingRef.value = true;
      // 只上传不是成功状态的
      const uploadFileList =
        fileListRef.value.filter((item) => item.status !== UploadResultStatus.SUCCESS) || [];
      const data = await Promise.all(
        uploadFileList.map((item) => {
          return uploadApiByItem(item);
        }),
      );
      isUploadingRef.value = false;
      // 生产环境:抛出错误
      const errorList = data.filter((item: any) => !item.success);
      if (errorList.length > 0) throw errorList;
    } catch (e) {
      isUploadingRef.value = false;
      throw e;
    }
  }

  //   点击保存
  function handleOk() {
    const { maxNumber } = props;
    // 如果文件数字数组中的成功状态的文件数量大于最大上传数量，则提示警告
    if (fileListRef.value.length > maxNumber) {
      return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
    }
    // 如果正在上传中，则提示警告
    if (isUploadingRef.value) {
      return createMessage.warning(t('component.upload.saveWarn'));
    }
    const fileList: any[] = [];

    for (const item of fileListRef.value) {
      const { status, response } = item;
      if (status === UploadResultStatus.SUCCESS && response) {
        // 返回完整的result对象，包含url、fileName、filePath
        fileList.push(unref(response.result));
      }
    }

    // 存在一个上传成功的即可保存
    if (fileList.length <= 0) {
      return createMessage.warning(t('component.upload.saveError'));
    }
    fileListRef.value = [];
    closeModal();
    emit('change', fileList);
  }
  // 关闭需要将将这些未保存的文件删除 （前后端）
  // 点击关闭：则所有操作不保存，包括上传的
  async function handleCloseFunc() {
    if (!isUploadingRef.value) {
      fileListRef.value = [];
      return true;
    } else {
      createMessage.warning(t('component.upload.uploadWait'));
      return false;
    }
  }
</script>
<style lang="less">
  .upload-modal {
    .ant-upload-list {
      display: none;
    }

    .ant-table-wrapper .ant-spin-nested-loading {
      padding: 0;
    }

    &-toolbar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &__btn {
        flex: 1;
        margin-left: 8px;
        text-align: right;
      }
    }
  }
</style>
