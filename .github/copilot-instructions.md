# AI 编码代理指南

本文档为在Vben Admin代码库中工作的AI代理提供必要的上下文信息。

## 架构概览

这是一个由**Turbo和pnpm**管理的**单体仓库**，包含：

- **主应用** (`src/`)：基于Vue 3 + Vite的管理员仪表板，核心业务为图书阅读功能
- **内部包** (`internal/`)：共享的构建配置（`vite-config`）、Lint配置（`eslint-config`、`stylelint-config`）、TypeScript配置（`ts-config`）
- **共享包** (`packages/`)：可重用的工具库，如`hooks`和`types`
- **后端服务** (`apps/test-server/`)：基于Koa的Node.js服务器，用于API模拟和测试

路径别名：`@/*` → `src/`，`#/*` → `types/`

## 关键开发工作流

### 构建与开发

```bash
# 安装依赖（使用pnpm）
pnpm install

# 启动开发服务器（热更新，自动打开 http://localhost:5173）
pnpm dev

# 生产构建（带内存优化）
pnpm build

# 类型检查
pnpm type:check

# Lint检查（通过Turbo在所有包上运行）
pnpm lint
```

后端服务运行在端口`:3000`（在`vite.config.ts`中配置代理）。

### 单体仓库命令

- `pnpm bootstrap`：安装所有依赖
- `turbo run build`：构建所有包（带缓存和依赖追踪）
- `turbo run stub`：为本地开发链接工作区包

## 项目结构与模式

### 前端架构（Vue 3 + Vite）

**核心初始化流程**（`src/main.ts`）：

1. Store初始化（Pinia） → 2. 应用配置加载 → 3. 全局组件注册 → 4. i18n设置 → 5. 路由配置 → 6. 路由守卫 → 7. 全局指令 → 8. 错误处理

**Store模块**（`src/store/modules/`）：使用Pinia并配备持久化插件

- `user.ts`：认证、角色、权限、IP追踪
- `app.ts`：全局UI状态
- `permission.ts`：动态路由构建
- `settingStore.ts`：主题、布局偏好（已持久化）
- `multipleTab.ts`：打开标签页追踪
- `epub.ts`：电子书阅读状态（项目核心业务逻辑）

**路由系统**（`src/router/`）：

- 基于用户角色/权限的动态路由生成
- 基本静态路由在`routes/`中，基于角色的路由通过`permission` store添加
- `guard/`：权限守卫在导航前验证路由
- 登出时重置路由，清空非白名单路由

**API层**（`src/api/`）：枚举化API端点配合类型化模型

```typescript
enum Api { Login = '/auth/login', GetUserInfo = '/user/info', ... }
export function loginApi(params: LoginParams) { return defHttp.post(...) }
```

**组件系统**（`src/components/`）：包装Ant Design Vue组件并增强

- `Button/`：增强支持`preIcon`、`postIcon`、颜色配置
- 通过`registerGlobComp.ts`全局注册（Input、Button、Layout、VXETable、VXEUI）
- 自定义组件：表单生成器、表格包装、Modal、Drawer、Upload

**业务视图**（`src/views/`）：

- `book/reading/`：EPUB阅读器，支持章节导航、主题切换、字体调整
- `dashboard/`：分析与工作台
- `form-design/`：动态表单生成器演示
- `permission/`：基于角色的访问控制示例

### HTTP客户端配置

Axios实例（`src/utils/http/axios/index.ts`）：

- 自动从auth缓存注入token
- 自定义响应转换配合错误处理
- 通过`AxiosRetry`类实现重试逻辑
- 路由变更时取消请求
- 错误日志存储到`errorLog` Pinia模块
- 状态码检查并显示用户友好的错误消息

### 国际化（i18n）

- 语言文件在`src/locales/`（JSON格式）
- 通过`useLocale()`Hook切换语言触发UI重新渲染
- Ant Design Vue语言通过Pinia store注入

### 设计系统

**样式**（`src/design/`）：

- `index.less`：主样式入口
- `color.less`：颜色调色板（主色、成功、警告、错误）
- `config.less`：设计Token定义
- `var/`：CSS自定义属性
- 主题切换更新Ant Design Token：`colorPrimary`、`colorSuccess`等

**图标系统**：Iconify + Ant Design图标，SVG精灵通过`virtual:svg-icons-register`

## 约定与模式

### TypeScript/Vue模式

- **Composition API** with `<script setup>`：现代Vue 3风格
- **类型定义**：模型在`src/api/*/model/`，全局类型在`types/`
- **Pinia stores**：使用`defineStore`定义，包含类型化的state、getters、actions
- **Props**：通过从`@vben/hooks`导入的`prop*`函数定义

### 命名约定

- 组件：PascalCase（如`BasicButton.vue`、`LoginForm.vue`）
- Store：`use*Store`（如`useUserStore`）
- Hook：`use*`（如`useTitle`、`useLocale`、`useDarkModeTheme`）
- 枚举：UPPER_SNAKE_CASE值（如`RoleEnum.SUPER`）
- API函数：`*Api()`后缀（如`loginApi()`）

### 状态管理模式

1. **持久化状态**：在`src/store/plugin/persist.ts`配置（token、用户信息、设置）
2. **登出重置**：`useUserStore().logout()`调用`resetRouter()`并清空Store
3. **角色守卫**：在组件/路由中检查`useUserStoreWithOut().getRoleList`

### 错误处理

- HTTP错误：由axios transform捕获，通过`createMessage.error()`或modal显示
- 全局错误处理：`src/logics/error-handle.ts`中的`setupErrorHandle()`
- 错误日志：存储在`errorLog` Pinia模块用于调试

## 外部依赖与集成

- **Ant Design Vue 4.2**：UI组件库（通过主题Token配置）
- **VXE Table**：数据表格高级组件
- **TinyMCE/Vditor**：富文本编辑器
- **ECharts**：仪表板图表库
- **XLSX/ExcelJS**：电子表格导入导出
- **Mock.js + vite-plugin-mock**：开发环境API模拟（见`mock/`目录）

**后端集成**：Koa服务器（`apps/test-server/`）提供：

- `/basic-api/*`：代理至`http://localhost:3000`
- `/upload`：文件上传端点`http://localhost:3300/upload`
- WebSocket：实时功能支持

## 常见任务文件参考

| 任务 | 关键文件 |
| --- | --- |
| 添加新路由 | [src/router/routes](src/router/routes), [mock/sys/menu.ts](mock/sys/menu.ts) |
| 创建Store | [src/store/modules](src/store/modules) (参考`user.ts`模板) |
| 添加API端点 | [src/api/sys/user.ts](src/api/sys/user.ts) 模式：enum + 类型化函数 |
| 自定义组件 | [src/components/Basic](src/components/Basic) (封装基础组件) |
| 主题/样式 | [src/design/index.less](src/design/index.less) + [App.vue](App.vue) token配置 |
| 权限管理 | [src/store/modules/permission.ts](src/store/modules/permission.ts) + [src/router/guard](src/router/guard) |
| 电子书功能 | [src/views/book/reading/index.vue](src/views/book/reading/index.vue) + [src/store/modules/epub.ts](src/store/modules/epub.ts) |

## Turbo单体仓库模式

[turbo.json](turbo.json)中的构建流程：

- `build`：依赖`^build`（先构建依赖），输出到`dist/`
- `stub`：链接工作区包
- `lint`：在所有包上运行ESLint
- `dev`：永不缓存，标记为持久后台任务

**工作区包**使用`workspace:*`在依赖中引用本地包（如`@vben/types`、`@vben/hooks`）。

## 调试技巧

1. **热更新不工作**：检查`vite.config.ts`的warmup路径是否包含您的文件
2. **类型错误**：运行`pnpm type:check`验证TypeScript编译
3. **路由问题**：检查浏览器控制台的权限守卫日志和路由状态
4. **Store未持久化**：确认模块已在`src/store/plugin/persist.ts`中注册
5. **API 401/403**：检查localStorage中`__AUTH_TOKEN__`键下的token

## EPUB电子书阅读器特定模式

### 文件加载流程（`src/views/book/reading/index.vue`）

用户通过文件选择器上传EPUB文件 → 调用`epubStore.loadEpubFile(file)` → Store异步加载解析 → 更新chapters和currentBook状态

### Store管理（`src/store/modules/epub.ts`）

- `isLoading`：加载状态标志
- `currentBook`：当前打开的书籍对象
- `chapters`：章节列表（标题、HTML内容）
- `currentChapterIndex`：当前章节索引
- `currentChapter`：计算属性，返回当前章节详情

### UI交互

- **章节导航**：`prevChapter()`、`nextChapter()` 更新`currentChapterIndex`
- **字体调整**：通过`settingStore.fontSize`状态控制，应用到`.chapter-content`的内联样式
- **主题切换**：`settingStore.theme`切换深色/浅色，通过LESS变量和`:deep()`样式应用
- **目录抽屉**：点击章节项直接设置`currentChapterIndex = index`
