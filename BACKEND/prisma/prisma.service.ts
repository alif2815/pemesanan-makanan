import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      const raw = process.env.DATABASE_URL ?? '';
      const masked = raw
        ? raw.replace(/(mysql:\/\/)(.*?:)(.*?@)(.*)/, (m, p1, p2, p3, p4) => `${p1}${p2.replace(/./g, '*')}${p3}${p4}`)
        : '(empty)';
      // Friendly error with instructions
      // eslint-disable-next-line no-console
      console.error('\nPrisma connection failed during startup.');
      // eslint-disable-next-line no-console
      console.error(`Current DATABASE_URL (partial/masked): ${masked}`);
      // eslint-disable-next-line no-console
      console.error('Please verify database credentials in BACKEND/.env or your environment variables.');
      // eslint-disable-next-line no-console
      console.error('If you haven\'t created the database, create it or switch to a local SQLite URL for development.');
      // eslint-disable-next-line no-console
      console.error('Example MySQL format: mysql://user:password@localhost:3306/database');
      // eslint-disable-next-line no-console
      console.error('After updating, run `npx prisma generate` and restart the app.\n');
      // exit so the developer can fix credentials
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
