import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateTransactionDto) {
    // Check order exists
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    // Ensure one transaction per order (schema enforces unique orderId)
    try {
      return await this.prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            orderId: dto.orderId,
            amount: dto.amount,
            paymentMethod: dto.paymentMethod as any,
            status: (dto.status as any) || '',
            paymentDate: dto.status === 'SUCCESS' ? new Date() : null,
          },
        });

        if (dto.status === 'SUCCESS') {
          await tx.order.update({ where: { id: dto.orderId }, data: { status: 'PAID' } });
        }

        return transaction;
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal membuat transaksi';
      throw new BadRequestException(msg);
    }
  }

  async findAll() {
    return this.prisma.transaction.findMany({ include: { order: { include: { orderItems: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const t = await this.prisma.transaction.findUnique({ where: { id }, include: { order: { include: { orderItems: true } } } });
    if (!t) throw new NotFoundException('Transaksi tidak ditemukan');
    return t;
  }

  async update(id: string, dto: UpdateTransactionDto) {
    await this.findOne(id);
    const { paymentMethod, status, ...sisaDto } = dto;
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...sisaDto,
        ...(paymentMethod && { paymentMethod: paymentMethod as any }),
        ...(status && { status: status as any }),
        ...(status === 'SUCCESS' ? { paymentDate: new Date() } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.transaction.delete({ where: { id } });
  }
}
