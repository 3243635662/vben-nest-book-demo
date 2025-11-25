export interface UploadApiResult {
  message: string;
  code: number;
  result: {
    url: string;
    fileName: string;
    filePath: string;
  };
}
