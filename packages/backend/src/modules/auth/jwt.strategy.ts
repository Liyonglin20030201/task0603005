import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'default-secret'),
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const admin = await this.adminRepo.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });
    if (!admin || admin.status === 0) {
      throw new UnauthorizedException('Token无效或账号已禁用');
    }
    return {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname,
      role: admin.role,
    };
  }
}
