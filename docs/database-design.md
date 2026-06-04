# 数据库设计文档

## 概述

本系统使用 MySQL 8.0 数据库，采用 TypeORM 作为 ORM 框架。数据库名称: `ecommerce_admin`

## ER 关系图

```
admins ──┐
         ├── roles (多对一)
         │
products ──┐
           ├── categories (多对一)
           ├── inventory (一对一)
           ├── inventory_logs (一对多)
           │
orders ────┐
           ├── order_items (一对多)
           ├── users (多对一)
           │
coupons ───┐
           ├── user_coupons (一对多)
           ├── users (通过 user_coupons)
```

## 表设计

### 1. admins (管理员表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 登录用户名 |
| password | VARCHAR(255) | NOT NULL | bcrypt 加密密码 |
| nickname | VARCHAR(50) | NULL | 昵称 |
| email | VARCHAR(100) | NULL | 邮箱 |
| phone | VARCHAR(20) | NULL | 手机号 |
| avatar | VARCHAR(255) | NULL | 头像URL |
| role_id | INT | FK → roles.id | 所属角色 |
| status | TINYINT | DEFAULT 1 | 0=禁用, 1=正常 |
| last_login_at | DATETIME | NULL | 最后登录时间 |
| created_at | DATETIME | AUTO | 创建时间 |
| updated_at | DATETIME | AUTO | 更新时间 |

### 2. roles (角色表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 角色名称 |
| code | VARCHAR(50) | UNIQUE, NOT NULL | 角色编码 |
| description | VARCHAR(255) | NULL | 描述 |
| permissions | JSON | NULL | 权限标识数组 |
| status | TINYINT | DEFAULT 1 | 状态 |
| created_at | DATETIME | AUTO | |
| updated_at | DATETIME | AUTO | |

**预设角色:**
- `super_admin`: 超级管理员 - 拥有全部权限
- `admin`: 管理员 - 除管理员管理外的全部操作权限
- `operator`: 操作员 - 商品/订单/库存的操作权限
- `viewer`: 查看者 - 只读权限

### 3. categories (商品分类表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL | 分类名称 |
| parent_id | INT | DEFAULT 0 | 父分类ID, 0=顶级 |
| sort | INT | DEFAULT 0 | 排序值 |
| icon | VARCHAR(255) | NULL | 图标 |
| status | TINYINT | DEFAULT 1 | |
| created_at | DATETIME | AUTO | |
| updated_at | DATETIME | AUTO | |

**设计说明:** 使用 `parent_id` 实现无限级树形结构。

### 4. products (商品表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| name | VARCHAR(200) | NOT NULL | 商品名称 |
| sku | VARCHAR(100) | UNIQUE, NOT NULL | 商品编码 |
| category_id | INT | FK → categories.id | 所属分类 |
| price | DECIMAL(10,2) | NOT NULL | 售价 |
| cost_price | DECIMAL(10,2) | NULL | 成本价 |
| description | TEXT | NULL | 商品描述 |
| images | JSON | NULL | 图片URL数组 |
| status | TINYINT | DEFAULT 1 | 0=下架, 1=上架 |
| created_at | DATETIME | AUTO | |
| updated_at | DATETIME | AUTO | |

### 5. inventory (库存表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| product_id | INT | UNIQUE, FK → products.id | 商品 |
| quantity | INT | NOT NULL, DEFAULT 0 | 当前库存量 |
| locked_quantity | INT | NOT NULL, DEFAULT 0 | 锁定库存（待发货） |
| warning_threshold | INT | DEFAULT 10 | 库存预警阈值 |
| version | INT | NOT NULL, DEFAULT 0 | **乐观锁版本号** |
| updated_at | DATETIME | AUTO | |

**关键设计:**
- `version` 字段用于乐观锁，每次更新时 version+1，防止并发超卖
- `locked_quantity` 表示已下单但未发货的数量
- 可用库存 = quantity - locked_quantity

### 6. inventory_logs (库存变动日志)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| product_id | INT | FK → products.id | |
| type | ENUM | 'in','out','lock','unlock','adjust' | 变动类型 |
| quantity | INT | NOT NULL | 变动数量 |
| before_quantity | INT | NOT NULL | 变动前数量 |
| after_quantity | INT | NOT NULL | 变动后数量 |
| order_id | INT | NULL | 关联订单ID |
| operator_id | INT | FK → admins.id | 操作人 |
| remark | VARCHAR(255) | NULL | 备注 |
| created_at | DATETIME | AUTO | |

### 7. users (前端用户表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| username | VARCHAR(50) | UNIQUE, NOT NULL | |
| password | VARCHAR(255) | NOT NULL | |
| nickname | VARCHAR(50) | NULL | |
| email | VARCHAR(100) | NULL | |
| phone | VARCHAR(20) | NULL | |
| avatar | VARCHAR(255) | NULL | |
| gender | TINYINT | DEFAULT 0 | 0=未知,1=男,2=女 |
| status | TINYINT | DEFAULT 1 | |
| created_at | DATETIME | AUTO | |
| updated_at | DATETIME | AUTO | |

### 8. orders (订单表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| order_no | VARCHAR(32) | UNIQUE, NOT NULL | 订单编号 |
| user_id | INT | FK → users.id | 下单用户 |
| status | ENUM | 见下方状态机 | 订单状态 |
| total_amount | DECIMAL(10,2) | NOT NULL | 商品总额 |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | 优惠减免 |
| pay_amount | DECIMAL(10,2) | NOT NULL | 实际支付 |
| coupon_id | INT | NULL | 使用的优惠券 |
| address | JSON | NULL | 收货地址 |
| remark | VARCHAR(255) | NULL | 买家备注 |
| paid_at | DATETIME | NULL | 支付时间 |
| shipped_at | DATETIME | NULL | 发货时间 |
| completed_at | DATETIME | NULL | 完成时间 |
| cancelled_at | DATETIME | NULL | 取消时间 |
| cancel_reason | VARCHAR(255) | NULL | 取消原因 |
| created_at | DATETIME | AUTO | |
| updated_at | DATETIME | AUTO | |

**订单状态枚举:**
- `pending_payment` - 待付款
- `paid` - 已付款
- `shipping` - 备货中
- `shipped` - 已发货
- `completed` - 已完成
- `cancelled` - 已取消
- `refunded` - 已退款

### 9. order_items (订单项表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| order_id | INT | FK → orders.id | |
| product_id | INT | FK → products.id | |
| product_name | VARCHAR(200) | | 商品名快照 |
| product_image | VARCHAR(255) | NULL | 商品图快照 |
| price | DECIMAL(10,2) | NOT NULL | 下单时单价 |
| quantity | INT | NOT NULL | 数量 |
| subtotal | DECIMAL(10,2) | NOT NULL | 小计 |

### 10. coupons (优惠券模板)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL | 券名称 |
| code | VARCHAR(50) | UNIQUE, NOT NULL | 券码 |
| type | ENUM | 'fixed','percentage' | 类型 |
| value | DECIMAL(10,2) | NOT NULL | 面额/折扣率 |
| min_amount | DECIMAL(10,2) | DEFAULT 0 | 最低使用金额 |
| total_count | INT | NOT NULL | 发行总量 |
| used_count | INT | DEFAULT 0 | 已使用量 |
| start_time | DATETIME | NOT NULL | 生效时间 |
| end_time | DATETIME | NOT NULL | 过期时间 |
| status | TINYINT | DEFAULT 1 | |
| created_at | DATETIME | AUTO | |
| updated_at | DATETIME | AUTO | |

### 11. user_coupons (用户优惠券)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | FK → users.id | |
| coupon_id | INT | FK → coupons.id | |
| status | ENUM | 'unused','used','expired' | |
| used_at | DATETIME | NULL | |
| order_id | INT | NULL | 使用的订单 |
| created_at | DATETIME | AUTO | |

### 12. operation_logs (操作日志)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| admin_id | INT | FK → admins.id | 操作人 |
| module | VARCHAR(50) | NOT NULL | 模块名 |
| action | VARCHAR(50) | NOT NULL | 操作类型 |
| target_id | INT | NULL | 操作目标ID |
| detail | JSON | NULL | 操作详情 |
| ip | VARCHAR(50) | NULL | 请求IP |
| user_agent | VARCHAR(500) | NULL | |
| created_at | DATETIME | AUTO | |

## 索引设计

```sql
-- orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

-- inventory_logs
CREATE INDEX idx_inv_logs_product_created ON inventory_logs(product_id, created_at);

-- operation_logs
CREATE INDEX idx_op_logs_admin_id ON operation_logs(admin_id);
CREATE INDEX idx_op_logs_module_action ON operation_logs(module, action);
CREATE INDEX idx_op_logs_created_at ON operation_logs(created_at);

-- user_coupons
CREATE INDEX idx_user_coupons_user_status ON user_coupons(user_id, status);
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(coupon_id);
```
