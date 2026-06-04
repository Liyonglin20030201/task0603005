import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../admin/entities/admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.adminRepo.findOne({
      where: { username: loginDto.username },
      relations: ['role'],
    });

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (admin.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    admin.lastLoginAt = new Date();
    await this.adminRepo.save(admin);

    const payload = { sub: admin.id, username: admin.username };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        email: admin.email,
        phone: admin.phone,
        avatar: admin.avatar,
        role: {
          id: admin.role.id,
          name: admin.role.name,
          code: admin.role.code,
          permissions: admin.role.permissions || [],
        },
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const admin = await this.adminRepo.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });
      if (!admin || admin.status === 0) {
        throw new UnauthorizedException('Token无效');
      }
      const newPayload = { sub: admin.id, username: admin.username };
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '30d' }),
      };
    } catch {
      throw new UnauthorizedException('RefreshToken已过期，请重新登录');
    }
  }

  async getProfile(adminId: number) {
    const admin = await this.adminRepo.findOne({
      where: { id: adminId },
      relations: ['role'],
    });
    if (!admin) {
      throw new UnauthorizedException('用户不存在');
    }
    const { password, ...result } = admin as any;
    return result;
  }
}
