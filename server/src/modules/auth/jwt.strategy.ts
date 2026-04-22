import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'cosmetics-shop-secret-2024',
    });
  }

  async validate(payload: any) {
    if (!payload.id) {
      throw new UnauthorizedException('Token 无效');
    }
    return { id: payload.id, openid: payload.openid, phone: payload.phone };
  }
}
