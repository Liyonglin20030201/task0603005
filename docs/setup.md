# 部署与运行指南

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL 8.0

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置数据库

创建 MySQL 数据库:
```sql
CREATE DATABASE ecommerce_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

复制环境变量文件:
```bash
cp packages/backend/.env.example packages/backend/.env
```

编辑 `.env` 文件填入数据库连接信息。

### 3. 启动后端

```bash
pnpm dev:backend
```

首次启动会自动同步数据库表结构（TypeORM synchronize=true）。

### 4. 初始化数据

```bash
cd packages/backend
pnpm seed
```

这会创建：
- 4个预设角色（超级管理员/管理员/操作员/查看者）
- 默认管理员账号: `admin` / `123456`
- 示例商品分类

### 5. 启动前端

```bash
pnpm dev:frontend
```

访问 http://localhost:5173

### 6. 接口文档

后端启动后访问: http://localhost:3000/api/docs

## 目录结构

```
packages/
├── backend/    # NestJS 后端 (端口 3000)
├── frontend/   # React 前端 (端口 5173, 代理 /api → 后端)
└── shared/     # 共享类型和常量
```

## 测试

```bash
pnpm test          # 运行全部后端测试
pnpm --filter backend test:cov  # 覆盖率报告
```

## 生产部署

```bash
pnpm build:backend     # 构建后端
pnpm build:frontend    # 构建前端

# 启动后端生产模式
cd packages/backend && node dist/main.js
```

前端构建产物在 `packages/frontend/dist/`，可用 Nginx 托管。
