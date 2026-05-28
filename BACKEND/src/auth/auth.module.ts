import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtGuard } from './jwt.guard';

@Module({
  providers: [AuthService, JwtGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtGuard],
})
export class AuthModule {}
