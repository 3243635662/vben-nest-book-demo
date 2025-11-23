import { UploadApiResult } from './model/uploadModel';
import { defHttp } from '@/utils/http/axios';
import { UploadFileParams } from '#/axios';
import { useGlobSetting } from '@/hooks/setting';
import { AxiosProgressEvent } from 'axios';

const { uploadUrl = '' } = useGlobSetting();

/**
 * @description: Upload interface
 */

// 上传接口
export function uploadApi(
  params: UploadFileParams,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
) {
  return defHttp.uploadFile<UploadApiResult>(
    {
      url: uploadUrl,
      onUploadProgress,
    },
    params,
  );
}

// 删除接口
export const deleteFileApi = (fileName: string) => {
  return defHttp.delete<{ code: number; result: any; message?: string }>(
    {
      url: `/book/file?fileName=${encodeURIComponent(fileName)}`,
    },
    {
      // 添加错误处理，确保返回统一的格式
      errorMessageMode: 'none',
    },
  );
};
