import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    if (!payload.id) {
      throw new UnauthorizedException('Token 无效');
    }
    // 查询用户最新状态和角色
    const user = await this.userRepo.findOne({
      where: { id: payload.id },
      select: ['id', 'role', 'status'],
    });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('账号已禁用');
    }
    return { id: payload.id, role: user.role };
  }
}
