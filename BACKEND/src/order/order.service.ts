import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: string;
    receiptImage?: string;
    items: { menuId: string; kuantitas: number }[];
  }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Pesanan harus berisi minimal 1 menu');
    }

    // Securely calculate total price in transaction to ensure consistent state
    return this.prisma.$transaction(async (tx) => {
      let totalPrice = 0;
      const itemDetails: { menuId: string; kuantitas: number; harga: number }[] = [];

      for (const item of data.items) {
        const menu = await tx.menu.findUnique({
          where: { id: item.menuId },
        });

        if (!menu) {
          throw new NotFoundException(`Menu dengan ID ${item.menuId} tidak ditemukan`);
        }

        if (!menu.isAvailable) {
          throw new BadRequestException(`Menu "${menu.nama}" sedang tidak tersedia/habis`);
        }

        const subtotal = menu.harga * item.kuantitas;
        totalPrice += subtotal;

        itemDetails.push({
          menuId: menu.id,
          kuantitas: Number(item.kuantitas),
          harga: menu.harga,
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          paymentMethod: data.paymentMethod,
          receiptImage: data.receiptImage,
          totalPrice,
          status: 'PENDING',
          orderItems: {
            create: itemDetails.map(d => ({
              menuId: d.menuId,
              kuantitas: d.kuantitas,
              harga: d.harga,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              menu: true,
            },
          },
        },
      });

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
    }

    return order;
  }

  async updateStatus(id: string, status: 'PAID' | 'NOT_PAID') {
    const order = await this.findOne(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
    });

    // If marked as PAID, trigger the email receipt
    if (status === 'PAID') {
      try {
        await this.sendReceiptEmail(updatedOrder);
        console.log(`[EMAIL] Receipt successfully sent to: ${updatedOrder.customerEmail}`);
      } catch (err) {
        console.error(`[EMAIL ERROR] Failed to send email to ${updatedOrder.customerEmail}:`, err);
      }
    }

    return updatedOrder;
  }

  private async sendReceiptEmail(order: any) {
    // Configure transporter using env variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER || 'your-mailtrap-user',
        pass: process.env.SMTP_PASS || 'your-mailtrap-password',
      },
    });

    // Create item rows for HTML
    const itemsHtml = order.orderItems
      .map((item: any) => {
        const itemTotal = item.harga * item.kuantitas;
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${item.menu.nama}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.kuantitas}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #666;">Rp ${item.harga.toLocaleString('id-ID')}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">Rp ${itemTotal.toLocaleString('id-ID')}</td>
          </tr>
        `;
      })
      .join('');

    const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Elegant Invoice HTML Template
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; padding: 40px 10px; line-height: 1.5; color: #444;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #eef2f5;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 30px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">NOTA PEMESANAN MAKANAN</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8; text-transform: uppercase;">Pembayaran Berhasil Diverifikasi</p>
          </div>

          <div style="padding: 30px;">
            <!-- Order Meta -->
            <table style="width: 100%; margin-bottom: 25px; font-size: 14px;">
              <tr>
                <td style="color: #666;">ID Transaksi:</td>
                <td style="text-align: right; font-weight: bold; color: #333;">#${order.id.slice(0, 8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="color: #666;">Tanggal Pesanan:</td>
                <td style="text-align: right; color: #333;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="color: #666;">Metode Pembayaran:</td>
                <td style="text-align: right; font-weight: bold; color: #4f46e5; text-transform: uppercase;">${order.paymentMethod}</td>
              </tr>
            </table>

            <hr style="border: 0; border-top: 1px solid #eef2f5; margin: 20px 0;">

            <!-- Customer Identity -->
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">Identitas Pelanggan</h3>
            <table style="width: 100%; margin-bottom: 25px; font-size: 14px; background-color: #f8fafc; padding: 15px; border-radius: 8px;">
              <tr>
                <td style="color: #666; padding-bottom: 5px;">Nama Lengkap:</td>
                <td style="text-align: right; font-weight: bold; color: #333; padding-bottom: 5px;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="color: #666; padding-bottom: 5px;">Alamat Email:</td>
                <td style="text-align: right; color: #333; padding-bottom: 5px;">${order.customerEmail}</td>
              </tr>
              <tr>
                <td style="color: #666;">Nomor Telepon:</td>
                <td style="text-align: right; color: #333;">${order.customerPhone}</td>
              </tr>
            </table>

            <!-- Order Table -->
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">Rincian Pesanan</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px; border-bottom: 2px solid #eef2f5; text-align: left; color: #4f46e5; font-weight: bold;">Menu</th>
                  <th style="padding: 12px; border-bottom: 2px solid #eef2f5; text-align: center; color: #4f46e5; font-weight: bold;">Qty</th>
                  <th style="padding: 12px; border-bottom: 2px solid #eef2f5; text-align: right; color: #4f46e5; font-weight: bold;">Harga</th>
                  <th style="padding: 12px; border-bottom: 2px solid #eef2f5; text-align: right; color: #4f46e5; font-weight: bold;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total Price -->
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <span style="font-size: 16px; font-weight: bold; color: #166534;">TOTAL DIBAYAR</span>
              <span style="font-size: 20px; font-weight: 800; color: #166534; text-align: right; display: block; width: 100%;">Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
            </div>

            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              Terima kasih atas pesanan Anda! Jika Anda memiliki pertanyaan mengenai nota ini, silakan hubungi kami.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #eef2f5; font-size: 12px; color: #666;">
            &copy; 2026 Food Ordering System. All rights reserved.
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Food Ordering System'}" <${process.env.SMTP_FROM || 'noreply@foodorder.com'}>`,
      to: order.customerEmail,
      subject: `[NOTA PAID] Bukti Pembayaran Pesanan #${order.id.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });
  }
}
