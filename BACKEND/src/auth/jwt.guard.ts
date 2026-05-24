import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header tidak ditemukan');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Format token salah (harus Bearer <token>)');
    }

    const token = parts[1];
    const decoded = await this.authService.verifyToken(token);

    if (!decoded || (decoded as any).role !== 'ADMIN') {
      throw new UnauthorizedException('Token tidak valid atau hak akses tidak diizinkan');
    }

    request.user = decoded;
    return true;
  }
}
