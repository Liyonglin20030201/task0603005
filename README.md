# 电商后台管理系统

一个功能完整的小型电商后台管理系统，包含完整业务流程（无真实支付）。

## 技术栈

- **前端:** React 18 + TypeScript + Vite + Ant Design 5 + React Router 6 + React Query + Zustand
- **后端:** NestJS 10 + TypeScript + TypeORM + Passport JWT + Swagger
- **数据库:** MySQL 8
- **工具链:** pnpm workspaces monorepo

## 功能模块

| 模块 | 说明 |
|------|------|
| 管理员登录 | JWT 认证, Token 刷新 |
| 商品管理 | CRUD, 图片, 分类关联 |
| 分类管理 | 树形结构, 无限级 |
| 库存管理 | 乐观锁防超卖, 变动记录, 预警 |
| 订单管理 | 状态机, 库存联动, 优惠券核销 |
| 用户管理 | 前端用户 CRUD |
| 优惠券管理 | 模板创建, 批量发放, 使用验证 |
| 权限角色 | RBAC 四级角色, 细粒度权限控制 |
| 数据报表 | 销售统计, 库存分析, ECharts 可视化 |
| 操作日志 | AOP 拦截自动记录 |
| 导入导出 | Excel 批量导入/导出 |

## 核心设计

### 库存可靠性
- 乐观锁（version 字段）+ 重试机制，防止并发超卖
- 每次变动记录完整日志（变动前后数量、操作人、关联订单）

### 订单状态机
```
pending_payment → paid → shipping → shipped → completed
       ↓                    ↓
   cancelled             refunded ← completed
```
严格校验状态转换合法性，非法转换直接拒绝。

### 权限分级
- super_admin: 全部权限
- admin: 除管理员管理外的全部操作权限
- operator: 商品/订单/库存操作
- viewer: 只读

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置数据库
cp packages/backend/.env.example packages/backend/.env
# 编辑 .env 填入 MySQL 连接信息

# 创建数据库
mysql -u root -e "CREATE DATABASE ecommerce_admin CHARACTER SET utf8mb4;"

# 启动后端 (端口 3000)
pnpm dev:backend

# 初始化数据 (角色 + 默认管理员)
cd packages/backend && pnpm seed

# 启动前端 (端口 5173)
pnpm dev:frontend
```

默认管理员: `admin` / `123456`

## 文档

- [数据库设计](docs/database-design.md)
- [接口文档](docs/api-docs.md) (启动后访问 http://localhost:3000/api/docs)
- [异常场景说明](docs/exception-scenarios.md)
- [部署指南](docs/setup.md)

## 测试

```bash
pnpm test    # 运行单元测试
```

覆盖关键场景:
- 库存乐观锁并发重试
- 订单状态机合法/非法转换
- 权限守卫拦截
