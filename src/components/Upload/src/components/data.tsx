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

// 根据文件后缀获取对应的图标URL
function getFileIconUrl(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // 文件类型映射（后续可以根据需要替换成不同的图标URL）
  const fileTypeMap: Record<string, string> = {
    // 编程语言文件
    java: 'https://img1.baidu.com/it/u=4209052967,2034962067&fm=253&fmt=auto?w=800&h=888',
    py: 'https://img1.baidu.com/it/u=915349462,2894576268&fm=253&fmt=auto&app=138&f=JPEG?w=1067&h=500',
    pyc: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    js: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    jsx: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    ts: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    tsx: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    vue: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    php: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    epub: 'https://img1.baidu.com/it/u=1926547966,1830790199&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=1023',
    go: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    rs: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    swift: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    kt: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    scala: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',

    // 配置文件
    json: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    xml: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    yaml: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    yml: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    ini: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    toml: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',

    // 文档文件
    md: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    txt: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    doc: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    docx: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    pdf: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',

    // 样式文件
    css: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    scss: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    sass: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    less: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    styl: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',

    // 脚本文件
    sh: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    bat: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    cmd: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    ps1: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',

    // 数据库文件
    sql: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    db: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
    sqlite: 'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800',
  };

  // 返回对应文件类型的图标URL，如果没有匹配则返回默认图标
  return (
    fileTypeMap[ext] ||
    'https://img2.baidu.com/it/u=2956282774,1327859232&fm=253&fmt=auto?w=990&h=800'
  );
}

// 文件上传model的列表
export function createTableColumns(): FileBasicColumn[] {
  return [
    {
      dataIndex: 'thumbUrl',
      title: t('component.upload.legend'),
      width: 100,
      customRender: ({ record }) => {
        const { url, thumbUrl, name } = (record as FileItem & { url?: string }) || {};
        // 优先使用thumbUrl，没有则使用url
        const imageUrl = thumbUrl || url;
        // 判断是否为图片类型（支持Base64和文件扩展名）
        if (imageUrl && (imageUrl.startsWith('data:image/') || isImgTypeByName(imageUrl))) {
          return <ThumbUrl fileUrl={imageUrl} />;
        } else {
          // 根据文件后缀获取对应的图标URL
          const fileIconUrl = getFileIconUrl(name || '');
          return <ThumbUrl fileUrl={fileIconUrl} />;
        }
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

// 文件上传的操作选项
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
            // 获取文件状态 标记：直接从record取出来的fileName是文件的本名不是后端数据的名字 真正的fileName早response.data.result.fileName中
            const { status, url, response } = record;
            console.log('普通模式删除记录:', record); // 调试日志
            console.log('响应数据:', response); // 调试日志

            // 情况1：文件未上传（状态不是SUCCESS）
            if (status !== UploadResultStatus.SUCCESS) {
              // 仅前端删除，不调用后端接口
              handleRemove.bind(null, {
                record,
                uidKey: 'uid',
                valueKey: 'url',
              })();
              createMessage.success('文件删除成功');
              return;
            }

            // 情况2：文件已上传，需要调用后端删除接口
            // 优先使用后端返回的fileName（带时间戳），其次使用fileName字段，最后使用name字段
            let deleteFileName = response?.data?.result?.fileName;

            // 如果没有fileName，但有url，则从url中提取文件名
            if (!deleteFileName && url) {
              const urlParts = url.split('/').filter((part) => part.trim() !== '');
              deleteFileName = urlParts.length > 0 ? urlParts.pop() : undefined;
            }
            // 还是没有直接就别删了
            if (!deleteFileName) {
              createMessage.error('缺少文件名，无法删除');
              return;
            }

            try {
              const res = await deleteFileApi(deleteFileName);

              // 判断删除是否成功（兼容不同的返回格式）
              if (res && (res as any) !== false) {
                // 后端删除成功后，执行前端删除
                handleRemove.bind(null, {
                  record,
                  uidKey: 'uid',
                  valueKey: 'url',
                })();
                createMessage.success('文件删除成功');
              } else {
                createMessage.error('删除失败');
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

// 文件预览modal列表 不同类型文件的图标（缩略图）显示
export function createPreviewColumns(): BasicColumn[] {
  return [
    {
      dataIndex: 'url',
      title: t('component.upload.legend'),
      width: 100,
      customRender: ({ record }) => {
        const { url, fileName } = record as PreviewFileItem;
        console.log('预览列接收到的record数据:', record);

        // 优先使用文件名判断文件类型
        const fileNameToUse = fileName || url?.split('/').pop() || '';

        if (url && (url.startsWith('data:image/') || isImgTypeByName(fileNameToUse))) {
          return <ThumbUrl fileUrl={url} />;
        } else {
          // 针对非图标文件实现 新的（在线的）图片样式
          const fileIconUrl = getFileIconUrl(fileNameToUse);
          return <ThumbUrl fileUrl={fileIconUrl} />;
        }
      },
    },
    {
      dataIndex: 'fileName',
      title: t('component.upload.backFileName'),
      align: 'center',
      customRender: ({ record }) => {
        const { fileName } = record as any;
        // 优先显示服务器返回的文件名，其次显示原始文件名
        return fileName || record?.url?.split('/').pop() || '';
      },
    },
  ];
}

export { getFileIconUrl };

// TODO 完善删除
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
            // 获取文件状态
            const { fileName, url, name, response } = record;

            // 调用后端删除接口

            let deleteFileName = null;

            // 首先尝试真正的路径：response.data.result.fileName（带时间戳的文件名）
            if (response?.data?.result?.fileName) {
              deleteFileName = response.data.result.fileName;
              console.log('从response.data.result.fileName获取的文件名:', deleteFileName); // 调试日志
            }
            // 然后尝试旧的路径：response.result.fileName
            else if (response?.result?.fileName) {
              deleteFileName = response.result.fileName;
              console.log('从response.result.fileName获取的文件名:', deleteFileName); // 调试日志
            }
            // 最后尝试其他字段
            else if (response?.fileName || fileName || name) {
              deleteFileName = response?.fileName || fileName || name;
              console.log('从其他字段获取的文件名:', deleteFileName); // 调试日志
            }

            if (!deleteFileName && url) {
              deleteFileName = url.split('/').pop();
            }

            if (!deleteFileName) {
              createMessage.error('缺少文件名，无法删除');
              return;
            }

            try {
              const res = await deleteFileApi(deleteFileName);

              // 判断删除是否成功
              if (res && (res as any) !== false) {
                // 后端删除成功后，执行前端删除
                handleRemove.bind(null, {
                  record,
                  uidKey: 'uid',
                  valueKey: 'url',
                })();
                createMessage.success('文件删除成功');
              } else {
                createMessage.error('删除失败');
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
