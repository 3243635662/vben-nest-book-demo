/**
 * Mock plugin for development and production.
 * https://github.com/anncwb/vite-plugin-mock
 */
import { viteMockServe } from 'vite-plugin-mock';

export function configMockPlugin({ isBuild }: { isBuild: boolean }) {
  return viteMockServe({
    ignore: /^_/,
    mockPath: 'mock',
    localEnabled: true, // 禁用开发环境Mock，使用真实后端API
    prodEnabled: isBuild,
    injectCode: `
      import { setupProdMockServer } from '../mock/_createProductionServer';

      setupProdMockServer();
      `,
  });
}
