import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async transactionsReport(start?: string, end?: string) {
    try {
      const where: any = {};
      if (start || end) {
        where.createdAt = {};
        if (start) where.createdAt.gte = new Date(start);
        if (end) where.createdAt.lte = new Date(end);
      }

      const transactions = await this.prisma.transaction.findMany({
        where,
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      });

      const totalAmount = transactions.reduce((s, t) => s + Number(t.amount), 0);

      return {
        count: transactions.length,
        totalAmount,
        transactions,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal membuat laporan';
      throw new BadRequestException(msg);
    }
  }
}
