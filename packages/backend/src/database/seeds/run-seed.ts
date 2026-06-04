import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { RoleCode, ROLE_PERMISSIONS } from '@ecommerce/shared';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ecommerce_admin',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功，开始初始化数据...');

  const roleRepo = dataSource.getRepository('Role');
  const adminRepo = dataSource.getRepository('Admin');

  const existingRoles = await roleRepo.find();
  if (existingRoles.length === 0) {
    const roles = [
      {
        name: '超级管理员',
        code: RoleCode.SUPER_ADMIN,
        description: '拥有全部权限',
        permissions: ROLE_PERMISSIONS[RoleCode.SUPER_ADMIN],
        status: 1,
      },
      {
        name: '管理员',
        code: RoleCode.ADMIN,
        description: '除管理员管理外的全部操作权限',
        permissions: ROLE_PERMISSIONS[RoleCode.ADMIN],
        status: 1,
      },
      {
        name: '操作员',
        code: RoleCode.OPERATOR,
        description: '商品/订单/库存的操作权限',
        permissions: ROLE_PERMISSIONS[RoleCode.OPERATOR],
        status: 1,
      },
      {
        name: '查看者',
        code: RoleCode.VIEWER,
        description: '只读权限',
        permissions: ROLE_PERMISSIONS[RoleCode.VIEWER],
        status: 1,
      },
    ];

    await roleRepo.save(roles);
    console.log('角色初始化完成');
  }

  const existingAdmin = await adminRepo.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const superRole = await roleRepo.findOne({ where: { code: RoleCode.SUPER_ADMIN } });
    const hashedPassword = await bcrypt.hash('123456', 10);
    await adminRepo.save({
      username: 'admin',
      password: hashedPassword,
      nickname: '超级管理员',
      email: 'admin@example.com',
      roleId: superRole.id,
      status: 1,
    });
    console.log('默认管理员创建完成 (admin / 123456)');
  }

  const categoryRepo = dataSource.getRepository('Category');
  const existingCategories = await categoryRepo.find();
  if (existingCategories.length === 0) {
    const categories = [
      { name: '电子产品', parentId: 0, sort: 1, status: 1 },
      { name: '服装鞋帽', parentId: 0, sort: 2, status: 1 },
      { name: '食品饮料', parentId: 0, sort: 3, status: 1 },
      { name: '手机', parentId: 1, sort: 1, status: 1 },
      { name: '电脑', parentId: 1, sort: 2, status: 1 },
      { name: '男装', parentId: 2, sort: 1, status: 1 },
      { name: '女装', parentId: 2, sort: 2, status: 1 },
    ];
    await categoryRepo.save(categories);
    console.log('分类初始化完成');
  }

  console.log('数据初始化完成！');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('初始化失败:', err);
  process.exit(1);
});
