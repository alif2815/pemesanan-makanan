import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReservationDto) {
    try {
      return await this.prisma.reservation.create({ data: { ...dto, date: new Date(dto.date) } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal membuat reservasi';
      throw new BadRequestException(msg);
    }
  }

  async findAll() {
    return this.prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const r = await this.prisma.reservation.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Reservasi tidak ditemukan');
    return r;
  }

  async update(id: string, dto: UpdateReservationDto) {
    await this.findOne(id);
    return this.prisma.reservation.update({ where: { id }, data: { ...dto, ...(dto.date && { date: new Date(dto.date) }) } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.reservation.delete({ where: { id } });
  }
}
