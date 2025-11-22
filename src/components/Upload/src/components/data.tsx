import type { BasicColumn, ActionItem } from '@/components/Table';
import { FileBasicColumn, FileItem, PreviewFileItem, UploadResultStatus } from '../types/typing';
import { isImgTypeByName } from '../helper';
import { Progress, Tag } from 'ant-design-vue';
import TableAction from '@/components/Table/src/components/TableAction.vue';
import ThumbUrl from './ThumbUrl.vue';
import { useI18n } from '@/hooks/web/useI18n';
import { previewColumnsFnType } from '../props';
import { deleteFileApi } from '@/api/sys/upload';
import { useMessage } from '../../../../hooks/web/useMessage';

const { createMessage } = useMessage();
const { t } = useI18n();

// 文件上传列表
export function createTableColumns(): FileBasicColumn[] {
  return [
    {
      dataIndex: 'thumbUrl',
      title: t('component.upload.legend'),
      width: 100,
      customRender: ({ record }) => {
        const { url, thumbUrl } = (record as FileItem & { url?: string }) || {};
        // 优先使用thumbUrl，没有则使用url
        const imageUrl = thumbUrl || url;
        // 判断是否为图片类型
        if (imageUrl && isImgTypeByName(imageUrl)) {
          return <ThumbUrl fileUrl={imageUrl} />;
        } else if (url) {
          // 非图片文件显示下载链接
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <span
                style={{
                  fontSize: '14px',
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                文件
              </span>
            </a>
          );
        }
        return null;
      },
    },
    {
      dataIndex: 'name',
      title: t('component.upload.fileName'),
      align: 'left',
      customRender: ({ text, record }) => {
        const { percent, status: uploadStatus } = (record as FileItem) || {};
        let status: 'normal' | 'exception' | 'active' | 'success' = 'normal';
        if (uploadStatus === UploadResultStatus.ERROR) {
          status = 'exception';
        } else if (uploadStatus === UploadResultStatus.UPLOADING) {
          status = 'active';
        } else if (uploadStatus === UploadResultStatus.SUCCESS) {
          status = 'success';
        }
        return (
          <div>
            <p class="truncate mb-1 max-w-[280px]" title={text}>
              {text}
            </p>
            <Progress percent={percent} size="small" status={status} />
          </div>
        );
      },
    },
    {
      dataIndex: 'size',
      title: t('component.upload.fileSize'),
      width: 100,
      customRender: ({ text = 0 }) => {
        return text && (text / 1024).toFixed(2) + 'KB';
      },
    },
    {
      dataIndex: 'status',
      title: t('component.upload.fileStatue'),
      width: 100,
      customRender: ({ text }) => {
        if (text === UploadResultStatus.SUCCESS) {
          return <Tag color="green">{() => t('component.upload.uploadSuccess')}</Tag>;
        } else if (text === UploadResultStatus.ERROR) {
          return <Tag color="red">{() => t('component.upload.uploadError')}</Tag>;
        } else if (text === UploadResultStatus.UPLOADING) {
          return <Tag color="blue">{() => t('component.upload.uploading')}</Tag>;
        }

        return text || t('component.upload.pending');
      },
    },
  ];
}
export function createActionColumn(handleRemove: Function): FileBasicColumn {
  return {
    width: 120,
    title: t('component.upload.operating'),
    dataIndex: 'action',
    fixed: false,
    customRender: ({ record }) => {
      const actions: ActionItem[] = [
        {
          label: t('component.upload.del'),
          color: 'error',
          onClick: async () => {
            // 修复：从record中提取正确的fileName
            let fileName = record.fileName;

            // 如果没有fileName，但有url，则从url中提取文件名
            if (!fileName && record.url) {
              // 修复：从URL中提取文件名部分，处理可能的空值
              const urlParts = record.url.split('/').filter((part) => part.trim() !== '');
              fileName = urlParts.length > 0 ? urlParts.pop() : undefined;
            }

            if (!fileName) {
              createMessage.error('缺少文件名，无法删除');
              return;
            }

            try {
              const res = await deleteFileApi(fileName);
              if (res.code === 0) {
                handleRemove.bind(null, {
                  record,
                  uidKey: 'uid',
                  valueKey: 'url',
                })();
                createMessage.success('文件删除成功');
              } else {
                createMessage.error(res.message || '删除失败');
              }
            } catch (error) {
              console.error('删除文件时出错:', error);
              createMessage.error('删除文件时发生错误');
            }
          },
        },
      ];
      return <TableAction actions={actions} outside={true} />;
    },
  };
}
// 文件预览列表
export function createPreviewColumns(): BasicColumn[] {
  return [
    {
      dataIndex: 'url',
      title: t('component.upload.legend'),
      width: 100,
      customRender: ({ record }) => {
        const { url } = (record as PreviewFileItem) || {};
        return isImgTypeByName(url) && <ThumbUrl fileUrl={url} />;
      },
    },
    {
      dataIndex: 'name',
      title: t('component.upload.fileName'),
      align: 'left',
    },
  ];
}

export function createPreviewActionColumn({
  handleRemove,
  handleDownload,
}: {
  handleRemove: previewColumnsFnType['handleRemove'];
  handleDownload: Fn;
}): BasicColumn {
  return {
    width: 160,
    title: t('component.upload.operating'),
    dataIndex: 'action',
    fixed: false,
    customRender: ({ record }) => {
      const actions: ActionItem[] = [
        {
          label: t('component.upload.del'),
          color: 'error',
          onClick: async () => {
            // 修复：从record中提取正确的fileName
            let fileName = record.fileName || record.name;

            // 如果没有fileName，但有url，则从url中提取文件名
            if (!fileName && record.url) {
              // 从URL中提取文件名部分
              fileName = record.url.split('/').pop();
            }

            if (!fileName) {
              createMessage.error('缺少文件名，无法删除');
              return;
            }

            try {
              const res = await deleteFileApi(fileName);
              if (res.code === 0) {
                handleRemove.bind(null, {
                  record,
                  uidKey: 'uid',
                  valueKey: 'url',
                })();
                createMessage.success('文件删除成功');
              } else {
                createMessage.error(res.message || '删除失败');
              }
            } catch (error) {
              console.error('删除文件时出错:', error);
              createMessage.error('删除文件时发生错误');
            }
          },
        },
        {
          label: t('component.upload.download'),
          onClick: handleDownload.bind(null, record),
        },
      ];

      return <TableAction actions={actions} outside={true} />;
    },
  };
}
