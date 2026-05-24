import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  // Automatically seed the admin user on startup if no users exist
  async onModuleInit() {
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
      console.log(`[SEED] Created default admin user:`);
      console.log(`Email: ${defaultEmail}`);
      console.log(`Password: ${defaultPassword}`);
    }
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

    const secret = process.env.JWT_SECRET || 'food-ordering-system-secret-key-2026-ukl';
    const token = jwt.sign(
      { id: user.id, email: user.email, nama: user.nama, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    return {
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
      },
    };
  }

  async verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET || 'food-ordering-system-secret-key-2026-ukl';
      return jwt.verify(token, secret);
    } catch (e) {
      return null;
    }
  }
}
