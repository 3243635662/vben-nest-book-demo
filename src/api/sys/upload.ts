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

// 创建接口
export const createBookApi = (data: any) => {
  return defHttp.post<boolean>(
    {
      url: '/book/create',
      data: data, // 使用data而不是params，确保数据在请求体中
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
    {
      errorMessageMode: 'none',
    },
  );
};
