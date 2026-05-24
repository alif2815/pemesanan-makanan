import { Controller, Get, Post, Put, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrderService } from './order.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `receipt-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Format file hanya boleh gambar (jpg, jpeg, png, gif)!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Max size: 5MB
      },
    }),
  )
  async checkout(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('Bukti pembayaran (foto) wajib diunggah!');
    }

    if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.paymentMethod) {
      throw new BadRequestException('Identitas pelanggan (nama, email, telpon) dan metode pembayaran wajib diisi!');
    }

    let itemsArray = [];
    try {
      itemsArray = typeof body.items === 'string' ? JSON.parse(body.items) : body.items;
    } catch (e) {
      throw new BadRequestException('Format items tidak valid (harus JSON array string)');
    }

    return this.orderService.create({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      paymentMethod: body.paymentMethod,
      receiptImage: file.filename,
      items: itemsArray,
    });
  }

  // Admin endpoints
  @Get()
  @UseGuards(JwtGuard)
  async findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(JwtGuard)
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    if (!body.status || !['PAID', 'NOT_PAID'].includes(body.status)) {
      throw new BadRequestException('Status tidak valid (harus PAID atau NOT_PAID)');
    }
    return this.orderService.updateStatus(id, body.status);
  }
}
