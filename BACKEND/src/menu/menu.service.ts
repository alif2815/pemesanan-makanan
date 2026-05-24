import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    nama: string;
    harga: number;
    deskripsi?: string;
    category: string;
    imageURL?: string;
    isAvailable?: boolean;
  }) {
    return this.prisma.menu.create({
      data: {
        nama: data.nama,
        harga: Number(data.harga),
        deskripsi: data.deskripsi,
        category: data.category,
        imageURL: data.imageURL,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      },
    });
  }

  async findAll(showUnavailable = true) {
    if (showUnavailable) {
      return this.prisma.menu.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.menu.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
    }
    return menu;
  }

  async update(id: string, data: any) {
    await this.findOne(id); // Check existence
    
    const updateData: any = {};
    if (data.nama !== undefined) updateData.nama = data.nama;
    if (data.harga !== undefined) updateData.harga = Number(data.harga);
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageURL !== undefined) updateData.imageURL = data.imageURL;
    if (data.isAvailable !== undefined) {
      updateData.isAvailable = typeof data.isAvailable === 'string' 
        ? data.isAvailable === 'true' 
        : Boolean(data.isAvailable);
    }

    return this.prisma.menu.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.findOne(id); // Check existence
    return this.prisma.menu.delete({
      where: { id },
    });
  }
}
