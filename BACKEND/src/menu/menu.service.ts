import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto) {
    // Validate required fields
    if (!createMenuDto.nama || !createMenuDto.category) {
      throw new BadRequestException('Nama dan kategori wajib diisi');
    }

    if (createMenuDto.harga < 0) {
      throw new BadRequestException('Harga tidak boleh negatif');
    }

    try {
      return await this.prisma.menu.create({
        data: {
          nama: createMenuDto.nama.trim(),
          harga: createMenuDto.harga,
          deskripsi: createMenuDto.deskripsi?.trim(),
          category: createMenuDto.category.trim(),
          imageURL: createMenuDto.imageURL?.trim(),
          isAvailable: createMenuDto.isAvailable ?? true,
          stock: createMenuDto.stock ?? 0,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat menu';
      throw new BadRequestException(`Gagal membuat menu: ${errorMessage}`);
    }
  }

  async findAll(showUnavailable = true) {
    try {
      return await this.prisma.menu.findMany({
        where: showUnavailable ? {} : { isAvailable: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil menu';
      throw new BadRequestException(`Gagal mengambil menu: ${errorMessage}`);
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('ID menu wajib diisi');
    }

    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: {
            orderId: true,
            kuantitas: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    // Verify menu exists
    await this.findOne(id);

    if (updateMenuDto.harga !== undefined && updateMenuDto.harga < 0) {
      throw new BadRequestException('Harga tidak boleh negatif');
    }

    try {
      return await this.prisma.menu.update({
        where: { id },
        data: {
          ...(updateMenuDto.nama && { nama: updateMenuDto.nama.trim() }),
          ...(updateMenuDto.harga !== undefined && { harga: updateMenuDto.harga }),
          ...(updateMenuDto.deskripsi !== undefined && { deskripsi: updateMenuDto.deskripsi?.trim() }),
          ...(updateMenuDto.category && { category: updateMenuDto.category.trim() }),
          ...(updateMenuDto.imageURL !== undefined && { imageURL: updateMenuDto.imageURL?.trim() }),
          ...(updateMenuDto.isAvailable !== undefined && { isAvailable: updateMenuDto.isAvailable }),
          ...(updateMenuDto.stock !== undefined && { stock: updateMenuDto.stock }),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal update menu';
      throw new BadRequestException(`Gagal update menu: ${errorMessage}`);
    }
  }

  async delete(id: string) {
    // Verify menu exists
    await this.findOne(id);

    try {
      // Check if menu has related order items
      const orderItemCount = await this.prisma.orderItem.count({
        where: { menuId: id },
      });

      if (orderItemCount > 0) {
        throw new BadRequestException(
          `Tidak bisa menghapus menu karena sudah digunakan dalam ${orderItemCount} pesanan`
        );
      }

      return await this.prisma.menu.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus menu';
      throw new BadRequestException(`Gagal menghapus menu: ${errorMessage}`);
    }
  }

  // Additional utility method for filtering by category
  async findByCategory(category: string) {
    if (!category) {
      throw new BadRequestException('Kategori wajib diisi');
    }

    try {
      return await this.prisma.menu.findMany({
        where: {
          category: category.trim(),
          isAvailable: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mencari menu';
      throw new BadRequestException(`Gagal mencari menu: ${errorMessage}`);
    }
  }
}
