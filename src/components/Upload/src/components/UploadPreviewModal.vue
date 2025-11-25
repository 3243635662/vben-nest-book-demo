<template>
  <BasicModal
    width="800px"
    :title="t('component.upload.preview')"
    class="upload-preview-modal"
    v-bind="$attrs"
    @register="register"
    :showOkBtn="false"
  >
    <FileList :dataSource="fileListRef" :columns="columns" :actionColumn="actionColumn" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { watch, ref } from 'vue';
  import FileList from './FileList.vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { handleFnKey, previewProps } from '../props';
  import { BaseFileItem, FileBasicColumn, PreviewFileItem } from '../types/typing';
  import { downloadByUrl } from '@/utils/file/download';
  import { createPreviewColumns, createPreviewActionColumn } from './data';
  import { useI18n } from '@/hooks/web/useI18n';
  import { isArray, isFunction } from '@/utils/is';
  import { BasicColumn } from '@/components/Table';
  import { useMessage } from '@/hooks/web/useMessage';
  import { buildUUID } from '@/utils/uuid';

  const { createMessage } = useMessage();

  const props = defineProps(previewProps);

  const emit = defineEmits(['list-change', 'register', 'delete']);

  let columns: BasicColumn[] | FileBasicColumn[] = createPreviewColumns();
  let actionColumn: any;

  const [register] = useModalInner();
  const { t } = useI18n();

  const fileListRef = ref<BaseFileItem[] | Array<any>>([]);

  watch(
    () => props.previewColumns,
    () => {
      if (Array.isArray(props.previewColumns) && props.previewColumns.length) {
        columns = props.previewColumns;
        actionColumn = null;
      } else if (isFunction(props.previewColumns)) {
        columns = props.previewColumns({ handleRemove, handleAdd });
      } else {
        columns = createPreviewColumns();
        actionColumn = createPreviewActionColumn({ handleRemove, handleDownload });
      }
    },
    { immediate: true },
  );

  watch(
    () => props.value,
    (value) => {
      if (!isArray(value)) value = [];

      // 如果提供了beforePreviewData回调，使用它处理数据
      if (props.beforePreviewData) {
        try {
          value = props.beforePreviewData(value) as any;
        } catch (error) {
          console.error('beforePreviewData处理失败:', error);
        }
      }

      // 确保数据格式正确

      fileListRef.value = value
        .filter((item) => !!item)
        .map((item) => {
          console.log('处理预览数据项:', item); // 调试日志

          // 如果已经是正确的格式，直接返回
          if (typeof item === 'object' && item.url && item.uid) {
            console.log('已有格式，直接返回:', item); // 调试日志
            // 确保包含正确的响应数据结构
            return {
              ...item,
              // 保留后端返回的fileName（带时间戳的文件名）
              fileName:
                item.fileName || item.response?.fileName || item.response?.data?.result?.fileName,
              // 保留完整的响应数据
              response: item.response,
            };
          }

          // 如果是字符串，转换为对象格式
          if (typeof item === 'string') {
            const converted = {
              uid: buildUUID(),
              url: item,
              type: item.split('.').pop() || '',
              name: item.split('/').pop() || '',
            };
            console.log('字符串转换:', converted); // 调试日志
            return converted;
          }

          // 其他情况确保有必要的字段
          const converted = {
            uid: item?.uid || buildUUID(),
            url: item?.url || item,
            type: item?.type || item?.url?.split('.').pop() || '',
            name: item?.name || item?.url?.split('/').pop() || '',
            // 保留后端返回的fileName（带时间戳的文件名）
            fileName:
              item?.fileName || item?.response?.fileName || item?.response?.data?.result?.fileName,
            // 保留完整的响应数据
            response: item?.response,
          };
          console.log('对象转换:', converted);
          return converted;
        });
    },
    { immediate: true },
  );

  // 删除
  function handleRemove(obj: Record<handleFnKey, any>) {
    let { record = {}, valueKey = 'url', uidKey = 'uid' } = obj;
    const index = fileListRef.value.findIndex((item) => item[uidKey] === record[uidKey]);
    if (index !== -1) {
      const removed = fileListRef.value.splice(index, 1);
      const removedItem = removed[0];

      // 获取文件名用于删除操作
      let fileName = null;

      // 优先使用服务器返回的文件名（带时间戳）
      if (removedItem.response) {
        // 首先尝试真正的路径：file.response.data.result.fileName
        if (removedItem.response.data?.result?.fileName) {
          fileName = removedItem.response.data.result.fileName;
          console.log('从response.data.result.fileName获取的文件名:', fileName); // 调试日志
        }
        // 然后尝试旧的路径：file.response.result.fileName
        else if (removedItem.response.result?.fileName) {
          fileName = removedItem.response.result.fileName;
          console.log('从response.result.fileName获取的文件名:', fileName); // 调试日志
        }
        // 最后尝试直接的fileName字段
        else if (removedItem.response.fileName) {
          fileName = removedItem.response.fileName;
          console.log('从response.fileName获取的文件名:', fileName); // 调试日志
        }
      }

      // 如果没有从response获取到，尝试其他方式
      if (!fileName) {
        // 尝试直接使用item的fileName
        fileName = removedItem.fileName || removedItem.name;
        console.log('使用item.fileName或name:', fileName); // 调试日志
      }

      console.log('最终用于删除的文件名:', fileName); // 调试日志

      // 触发删除事件，传递文件名
      emit('delete', fileName || removedItem[uidKey]);
      emit('list-change', fileListRef.value, valueKey);
    }
  }

  // 添加
  function handleAdd(obj: Record<handleFnKey, any>) {
    let { record = {}, valueKey = 'url', uidKey = 'uid' } = obj;
    const { maxNumber } = props;
    if (fileListRef.value.length + fileListRef.value.length > maxNumber) {
      return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
    }
    record[uidKey] = record[uidKey] ?? buildUUID();
    fileListRef.value = [...fileListRef.value, record];
    emit('list-change', fileListRef.value, valueKey);
  }

  // 下载
  function handleDownload(record: PreviewFileItem) {
    const { url = '' } = record;
    downloadByUrl({ url });
  }
</script>
<style lang="less">
  .upload-preview-modal {
    .ant-upload-list {
      display: none;
    }

    .ant-table-wrapper .ant-spin-nested-loading {
      padding: 0;
    }
  }
</style>
