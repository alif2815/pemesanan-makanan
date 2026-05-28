import { Injectable, OnModuleInit, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  // Seed admin user on startup
  async onModuleInit() {
    try {
      const userCount = await this.prisma.user.count();
      if (userCount === 0) {
        const defaultEmail = 'admin@foodorder.com';
        const defaultPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await this.prisma.user.create({
          data: {
            email: defaultEmail,
            password: hashedPassword,
            nama: 'Super Admin',
            role: 'ADMIN',
          },
        });
        console.log(`[SEED] Default admin user created:`);
        console.log(`Email: ${defaultEmail}`);
        console.log(`Password: ${defaultPassword}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[ERROR] Failed to seed admin user:', errorMessage);
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        nama: registerDto.nama,
        role: registerDto.role || 'CUSTOMER',
      },
    });

    return {
      message: 'Registrasi berhasil',
      user: this.sanitizeUser(user),
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Kredensial salah (email tidak ditemukan)');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kredensial salah (password salah)');
    }

    const token = this.generateToken(user);

    return {
      message: 'Login berhasil',
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return this.sanitizeUser(user);
  }

  async verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET || 'food-ordering-system-secret-key-2026-ukl';
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: any) {
    const secret = process.env.JWT_SECRET || 'food-ordering-system-secret-key-2026-ukl';
    return jwt.sign(
      { id: user.id, email: user.email, nama: user.nama, role: user.role },
      secret,
      { expiresIn: '7d' }
    );
  }

  private sanitizeUser(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
