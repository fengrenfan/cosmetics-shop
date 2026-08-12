import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('未登录');
    }

    const dbUser = await this.userRepo.findOne({
      where: { id: user.id },
      select: ['id', 'role', 'status'],
    });

    if (!dbUser || dbUser.status !== 1) {
      throw new ForbiddenException('账号已禁用');
    }

    if (dbUser.role !== 'admin') {
      throw new ForbiddenException('无管理员权限');
    }

    return true;
  }
}
