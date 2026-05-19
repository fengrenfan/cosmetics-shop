# AGENT.md

本文件用于指导 AI 编码代理在 `cosmetics-shop` 项目中协作。遵循“先理解、再小步修改、最后验证”的原则；若本文件与用户明确指令冲突，以用户指令为准。

## 项目上下文

- 项目名称：唯伊美妆 / Cosmetics Shop。
- 项目类型：全栈 B2C 电商小程序系统。
- 主要组成：
  - `server/`：NestJS 9 + TypeScript + TypeORM + MySQL，API 全局前缀为 `/api`。
  - `admin/`：Vue 3 + Vite + Element Plus + Pinia 管理后台。
  - `miniapp/`：uni-app + Vue 3 + Pinia 小程序 / H5 用户端。
  - `mock-server/`：Express mock 服务。
  - `openspec/`：规格驱动开发变更、设计和任务文档。

## 工作原则

1. 先读上下文，再编码。
   - 修改前查看相关模块、已有实现、路由、DTO、实体、接口调用方和测试。
   - 不确定需求时先说明疑点；存在多种解释时列出取舍，不要静默选择。

2. 保持简单。
   - 只实现用户要求的功能，不增加推测性能力。
   - 不为单次使用代码抽象公共层。
   - 优先沿用现有模块结构、命名、响应格式和 UI 习惯。

3. 外科手术式修改。
   - 只改与任务直接相关的文件。
   - 不顺手重构、重排格式、删除无关代码或改动构建产物。
   - 若发现无关问题，记录并告知，不擅自修复。
   - 不覆盖用户未提交改动；遇到同文件已有改动时先理解后协同修改。

4. 以验证闭环为目标。
   - Bug 修复优先补充或运行能复现问题的测试。
   - 新功能按影响范围运行最小必要验证。
   - 无法运行验证时说明原因和剩余风险。

## 目录与职责

```text
server/src/modules/        后端业务模块
server/src/common/         后端公共拦截器、守卫、工具
server/src/config/         数据库初始化等配置
admin/src/views/           管理后台页面
admin/src/router/          管理后台路由
admin/src/utils/request.js 管理后台 Axios 封装
miniapp/src/pages/         小程序页面
miniapp/src/components/    小程序公共组件
miniapp/src/stores/        小程序 Pinia 状态
miniapp/src/utils/         小程序请求、认证等工具
openspec/changes/          规格驱动开发变更
```

## 后端规范

- 模块文件遵循现有结构：`*.entity.ts`、`*.dto.ts`、`*.service.ts`、`*.controller.ts`、`*.module.ts`。
- 类名使用 PascalCase，文件名使用 kebab-case，数据库表和字段使用 snake_case，API 路径使用 kebab-case。
- 请求参数校验放在 DTO 中，使用 `class-validator`；依赖全局 `ValidationPipe` 的 `transform`、`whitelist`、`forbidNonWhitelisted`。
- 响应保持统一格式：成功 `{ code: 0, message: "success", data }`，错误返回明确 message。
- 认证接口沿用 JWT Bearer Token；需要用户身份的接口使用现有守卫和 `req.user` 模式。
- TypeORM 变更需同步实体、服务逻辑和必要的初始化 SQL；不要只改一端。
- 支付、订单、库存、优惠券、积分等核心交易逻辑必须优先考虑幂等性和状态流转，不做仅前端约束。

## 管理后台规范

- 使用 Vue 3 单文件组件，延续现有 Element Plus 风格。
- API 调用统一走 `admin/src/utils/request.js`，不要在页面中重复创建 Axios 实例。
- Token 使用 `admin_token`，路由守卫与登录跳转逻辑保持一致。
- 图片地址通过现有 `request.fixImageUrl` 处理。
- 新增后台页面时同步更新 `admin/src/router/index.js` 和对应菜单 / 布局入口。
- 表单修改必须包含前端校验和后端 DTO 校验，避免只校验一侧。

## 小程序规范

- API 调用统一走 `miniapp/src/utils/request.js`，保持 H5 走 `/api`、微信小程序走完整 API 域名的条件编译逻辑。
- 登录态使用现有 token 存储；游客识别沿用 `x-device-id`。
- 页面路由新增或调整时同步维护 `miniapp/src/pages.json`。
- 商品图片、SKU、价格、库存等字段优先使用已有标准化工具，例如 `normalizeProduct` 和 `fixImageUrl`。
- 跨端能力需考虑 H5 与 MP-WEIXIN 条件编译，不写只在单端可用的全局对象调用。

## OpenSpec 工作流

- 涉及新能力、较大行为调整或跨模块变更时，优先查看 `openspec/changes/` 是否已有对应 change。
- 实现已有 change 时遵循其 `proposal.md`、`design.md`、`tasks.md` 和 `specs/*/spec.md`。
- 如果用户要求先设计或提案，在 `openspec/changes/<change-id>/` 下补齐 proposal、design、tasks 和 spec delta。
- 每个任务应能在约 2 小时内验证完成；完成后更新任务状态。

## 常用命令

```bash
# 后端
cd server && npm run dev
cd server && npm run build
cd server && npm test

# 管理后台
cd admin && npm run dev
cd admin && npm run build

# 小程序 / H5
cd miniapp && npm run dev:h5
cd miniapp && npm run build:h5
cd miniapp && npm run dev:mp-weixin
cd miniapp && npm run build:mp-weixin

# Mock 服务
cd mock-server && npm run dev
```

## 验证建议

- 后端改动：至少运行 `cd server && npm test`；涉及编译或类型变更时运行 `cd server && npm run build`。
- 管理后台改动：运行 `cd admin && npm run build`；涉及交互时启动 dev server 并用浏览器检查关键流程。
- 小程序改动：运行对应端构建；H5 优先 `cd miniapp && npm run build:h5`，微信端改动运行 `cd miniapp && npm run build:mp-weixin`。
- 跨端或联调改动：同时验证后端和受影响前端，确认 API 路径、响应格式、认证头和错误处理一致。

## 禁止事项

- 不提交 `.env`、密钥、真实 token、生产数据库凭据或本地临时文件。
- 不主动修改 `dist/`、构建产物、锁文件，除非任务明确要求或依赖确实变化。
- 不使用破坏性 Git 命令清理用户改动。
- 不引入新的大型依赖，除非现有技术栈无法合理完成需求，并先说明理由。
- 不把 mock 逻辑混入生产业务代码；mock 行为应留在 `mock-server/` 或明确的开发配置中。

## 交付要求

- 说明改了哪些文件、实现了什么行为。
- 列出已运行的验证命令及结果。
- 若有未验证项，明确说明原因。
- 若发现与任务无关但值得处理的问题，单独列为后续建议，不混入本次改动。
