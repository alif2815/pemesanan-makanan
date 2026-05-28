import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { ReservationModule } from './reservation/reservation.module';
import { TransactionModule } from './transaction/transaction.module';
import { ReportModule } from './report/report.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    MenuModule,
    OrderModule,
    ReservationModule,
    TransactionModule,
    ReportModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

