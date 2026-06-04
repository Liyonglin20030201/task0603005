# 接口文档说明

## 概述

本系统使用 Swagger (OpenAPI 3.0) 自动生成接口文档，启动后端服务后可通过以下地址访问：

```
http://localhost:3000/api/docs
```

## 认证方式

所有接口（除登录外）需要在请求头中携带 JWT Token：

```
Authorization: Bearer <access_token>
```

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

## 接口概览

### 认证模块 `/api/auth`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /auth/login | 管理员登录 | 无 |
| POST | /auth/refresh | 刷新Token | 无 |
| GET | /auth/profile | 获取当前用户信息 | 登录即可 |

### 管理员管理 `/api/admins`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /admins | 管理员列表 | admin:view |
| GET | /admins/:id | 管理员详情 | admin:view |
| POST | /admins | 创建管理员 | admin:create |
| PUT | /admins/:id | 更新管理员 | admin:update |
| DELETE | /admins/:id | 删除管理员 | admin:delete |

### 角色管理 `/api/roles`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /roles | 角色列表 | role:view |
| GET | /roles/:id | 角色详情 | role:view |
| POST | /roles | 创建角色 | role:create |
| PUT | /roles/:id | 更新角色 | role:update |
| DELETE | /roles/:id | 删除角色 | role:delete |

### 商品管理 `/api/products`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /products | 商品列表 | product:view |
| GET | /products/:id | 商品详情 | product:view |
| POST | /products | 创建商品 | product:create |
| PUT | /products/:id | 更新商品 | product:update |
| DELETE | /products/:id | 删除商品 | product:delete |

### 分类管理 `/api/categories`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /categories | 分类列表 | category:view |
| GET | /categories/:id | 分类详情 | category:view |
| POST | /categories | 创建分类 | category:create |
| PUT | /categories/:id | 更新分类 | category:update |
| DELETE | /categories/:id | 删除分类 | category:delete |

### 库存管理 `/api/inventory`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /inventory | 库存列表 | inventory:view |
| GET | /inventory/:productId | 商品库存详情 | inventory:view |
| PUT | /inventory/adjust | 调整库存 | inventory:update |
| PUT | /inventory/:productId/warning | 设置预警阈值 | inventory:update |
| GET | /inventory/:productId/logs | 库存变动记录 | inventory:view |

### 订单管理 `/api/orders`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /orders | 订单列表 | order:view |
| GET | /orders/:id | 订单详情 | order:view |
| POST | /orders | 创建订单 | order:update |
| PUT | /orders/:id/status | 更新订单状态 | order:update |
| GET | /orders/:id/transitions | 获取可用状态转换 | order:view |

### 用户管理 `/api/users`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /users | 用户列表 | user:view |
| GET | /users/:id | 用户详情 | user:view |
| POST | /users | 创建用户 | user:create |
| PUT | /users/:id | 更新用户 | user:update |
| DELETE | /users/:id | 删除用户 | user:delete |

### 优惠券管理 `/api/coupons`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /coupons | 优惠券列表 | coupon:view |
| GET | /coupons/:id | 优惠券详情 | coupon:view |
| POST | /coupons | 创建优惠券 | coupon:create |
| PUT | /coupons/:id | 更新优惠券 | coupon:update |
| DELETE | /coupons/:id | 删除优惠券 | coupon:delete |
| POST | /coupons/distribute | 发放优惠券 | coupon:create |
| GET | /coupons/user/:userId | 用户优惠券列表 | coupon:view |

### 数据报表 `/api/reports`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /reports/dashboard | 仪表盘数据 | report:view |
| GET | /reports/sales | 销售报表 | report:view |
| GET | /reports/order-status | 订单状态分布 | report:view |
| GET | /reports/top-products | 热销商品排行 | report:view |
| GET | /reports/inventory | 库存报表 | report:view |

### 操作日志 `/api/logs`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /logs | 操作日志列表 | log:view |

### 导入导出 `/api/import-export`
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /import-export/products/export | 导出商品 | import_export:execute |
| POST | /import-export/products/import | 导入商品 | import_export:execute |
| GET | /import-export/orders/export | 导出订单 | import_export:execute |
| GET | /import-export/users/export | 导出用户 | import_export:execute |

## 通用查询参数

所有列表接口支持以下分页参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页条数 |
| sortBy | string | createdAt | 排序字段 |
| sortOrder | string | DESC | 排序方向 (ASC/DESC) |

各模块还有额外的筛选参数，具体见 Swagger 文档。
